import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { 
  Task, 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskFilter, 
  TaskStats,
  TaskStatus,
  TaskPriority,
  TaskEnergyLevel,
  TaskContext,
  PaginatedResponse,
  FocusSession,
  ApiResponse
} from '@adhd-dashboard/shared-types';
import { AuthStore } from './auth.store';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  stats: TaskStats | null;
  focusSessions: FocusSession[];
  activeFocusSession: FocusSession | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isFocusing: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  filters: TaskFilter;
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  stats: null,
  focusSessions: [],
  activeFocusSession: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isFocusing: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalTasks: 0,
  filters: {},
};

/**
 * Modern ADHD-focused tasks management store using NgRx Signals.
 * 
 * Provides task management functionality including:
 * - Task CRUD operations with ADHD-specific fields
 * - Focus session tracking for concentration monitoring
 * - Energy level and context-based task filtering
 * - Advanced analytics and insights
 * - Real-time task prioritization and suggestions
 */
export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    /**
     * Tasks due today filtered by user's energy level
     */
    todayTasks: computed(() => {
      const today = new Date().toDateString();
      return store.tasks().filter(task => {
        return task.dueDate && new Date(task.dueDate).toDateString() === today;
      });
    }),
    
    /**
     * Overdue tasks that need immediate attention
     */
    overdueTasks: computed(() => {
      const now = new Date();
      return store.tasks().filter(task => {
        return task.dueDate && 
               new Date(task.dueDate) < now && 
               task.status !== TaskStatus.COMPLETED;
      });
    }),
    
    /**
     * Tasks filtered by energy level for optimal task matching
     */
    tasksByEnergyLevel: computed(() => {
      const tasks = store.tasks();
      return {
        low: tasks.filter(t => t.energyLevel === TaskEnergyLevel.LOW),
        medium: tasks.filter(t => t.energyLevel === TaskEnergyLevel.MEDIUM),
        high: tasks.filter(t => t.energyLevel === TaskEnergyLevel.HIGH),
      };
    }),
    
    /**
     * Tasks grouped by context for better organization
     */
    tasksByContext: computed(() => {
      const tasks = store.tasks();
      return {
        work: tasks.filter(t => t.context === TaskContext.WORK),
        personal: tasks.filter(t => t.context === TaskContext.PERSONAL),
        health: tasks.filter(t => t.context === TaskContext.HEALTH),
        learning: tasks.filter(t => t.context === TaskContext.LEARNING),
        creative: tasks.filter(t => t.context === TaskContext.CREATIVE),
        social: tasks.filter(t => t.context === TaskContext.SOCIAL),
      };
    }),
    
    /**
     * High priority tasks that need attention
     */
    highPriorityTasks: computed(() => 
      store.tasks().filter(task => 
        task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT
      )
    ),
    
    /**
     * Tasks with high focus scores for performance tracking
     */
    highFocusTasks: computed(() =>
      store.tasks().filter(task => task.focusScore && task.focusScore >= 8)
    ),
    
    /**
     * Average focus score across all completed tasks
     */
    averageFocusScore: computed(() => {
      const tasksWithFocus = store.tasks().filter(t => t.focusScore);
      if (tasksWithFocus.length === 0) return 0;
      return tasksWithFocus.reduce((sum, task) => sum + (task.focusScore || 0), 0) / tasksWithFocus.length;
    }),
    
    /**
     * Tasks grouped by status with enhanced categorization
     */
    tasksByStatus: computed(() => {
      const tasks = store.tasks();
      return {
        todo: tasks.filter(t => t.status === TaskStatus.TODO),
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
        blocked: tasks.filter(t => t.status === TaskStatus.BLOCKED),
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED),
        cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED),
      };
    }),
  })),
  withMethods((store, httpClient = inject(HttpClient), authStore = inject(AuthStore)) => ({
    /**
     * Loads tasks with comprehensive filtering and pagination
     */
    async loadTasks(filters?: TaskFilter): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      
      try {
        const headers = authStore.getAuthHeaders();
        const params = new URLSearchParams();
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                params.append(key, value.join(','));
              } else {
                params.append(key, value.toString());
              }
            }
          });
        }

        const response = await httpClient.get<PaginatedResponse<Task>>(
          `/api/tasks?${params}`,
          { headers }
        ).toPromise();
        
        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to load tasks');
        }

        patchState(store, {
          tasks: [...(response.data || [])],
          currentPage: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalTasks: response.pagination?.totalItems || 0,
          filters: filters || {},
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to load tasks');
        patchState(store, {
          isLoading: false,
          error: errorMessage,
        });
      }
    },

    /**
     * Creates a new task with ADHD-specific features
     */
    async createTask(taskData: CreateTaskDto): Promise<void> {
      if (!taskData.title?.trim()) {
        patchState(store, { 
          error: 'Task title is required' 
        });
        return;
      }

      patchState(store, { isCreating: true, error: null });
      
      try {
        const headers = authStore.getAuthHeaders();
        const response = await httpClient.post<ApiResponse<Task>>(
          '/api/tasks',
          taskData,
          { headers }
        ).toPromise();
        
        if (!response || !response.success || !response.data) {
          throw new Error(response?.message || 'Failed to create task');
        }

        patchState(store, {
          tasks: [response.data, ...store.tasks()],
          isCreating: false,
          totalTasks: store.totalTasks() + 1,
        });
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to create task');
        patchState(store, {
          isCreating: false,
          error: errorMessage,
        });
      }
    },

    /**
     * Updates an existing task with comprehensive change tracking
     */
    async updateTask(taskId: string, updates: UpdateTaskDto): Promise<void> {
      if (!taskId?.trim()) {
        patchState(store, { 
          error: 'Task ID is required for update' 
        });
        return;
      }

      patchState(store, { isUpdating: true, error: null });
      
      try {
        const headers = authStore.getAuthHeaders();
        const response = await httpClient.patch<ApiResponse<Task>>(
          `/api/tasks/${taskId}`,
          updates,
          { headers }
        ).toPromise();
        
        if (!response || !response.success || !response.data) {
          throw new Error(response?.message || 'Failed to update task');
        }

        patchState(store, {
          tasks: store.tasks().map(task => 
            task.id === taskId ? response.data! : task
          ),
          selectedTask: store.selectedTask()?.id === taskId ? response.data! : store.selectedTask(),
          isUpdating: false,
        });
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to update task');
        patchState(store, {
          isUpdating: false,
          error: errorMessage,
        });
      }
    },

    /**
     * Deletes a task with proper cleanup
     */
    async deleteTask(taskId: string): Promise<void> {
      if (!taskId?.trim()) {
        patchState(store, { 
          error: 'Task ID is required for deletion' 
        });
        return;
      }

      try {
        const headers = authStore.getAuthHeaders();
        const response = await httpClient.delete<ApiResponse<void>>(
          `/api/tasks/${taskId}`, 
          { headers }
        ).toPromise();
        
        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to delete task');
        }
        
        patchState(store, {
          tasks: store.tasks().filter(task => task.id !== taskId),
          selectedTask: store.selectedTask()?.id === taskId ? null : store.selectedTask(),
          totalTasks: store.totalTasks() - 1,
        });
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to delete task');
        patchState(store, {
          error: errorMessage,
        });
      }
    },

    /**
     * Loads comprehensive task statistics for ADHD insights
     */
    async loadTaskStats(): Promise<void> {
      try {
        const headers = authStore.getAuthHeaders();
        const response = await httpClient.get<ApiResponse<TaskStats>>(
          '/api/tasks/stats',
          { headers }
        ).toPromise();
        
        if (response && response.success && response.data) {
          patchState(store, { stats: response.data });
        }
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to load stats');
        patchState(store, {
          error: errorMessage,
        });
      }
    },

    /**
     * Quick task creation with ADHD-friendly defaults
     */
    async quickCreateTask(
      title: string, 
      priority: TaskPriority = TaskPriority.MEDIUM,
      energyLevel: TaskEnergyLevel = TaskEnergyLevel.MEDIUM,
      estimatedDuration: number = 30
    ): Promise<void> {
      if (!title?.trim()) {
        patchState(store, { 
          error: 'Task title is required' 
        });
        return;
      }

      await this.createTask({
        title: title.trim(),
        priority,
        difficulty: 'medium' as any, // Default difficulty
        estimatedDuration,
        tags: [],
        energyLevel,
      });
    },

    /**
     * Toggles task status with smart status progression
     */
    async toggleTaskStatus(taskId: string): Promise<void> {
      const task = store.tasks().find(t => t.id === taskId);
      if (!task) {
        patchState(store, { 
          error: 'Task not found' 
        });
        return;
      }

      let newStatus: TaskStatus;
      switch (task.status) {
        case TaskStatus.TODO:
          newStatus = TaskStatus.IN_PROGRESS;
          break;
        case TaskStatus.IN_PROGRESS:
          newStatus = TaskStatus.COMPLETED;
          break;
        case TaskStatus.COMPLETED:
          newStatus = TaskStatus.TODO;
          break;
        default:
          newStatus = TaskStatus.TODO;
      }

      await this.updateTask(taskId, { status: newStatus });
    },

    /**
     * Updates filters and reloads tasks
     */
    updateFilters(filters: TaskFilter): void {
      patchState(store, { filters });
      this.loadTasks(filters);
    },

    /**
     * Selects a task for detailed view
     */
    selectTask(task: Task | null): void {
      patchState(store, { selectedTask: task });
    },

    /**
     * Clears error state
     */
    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);

/**
 * Extracts meaningful error messages from various error types
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    return error.error?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
} 