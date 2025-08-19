import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  filters: {},
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    todayTasks: computed(() => {
      const today = new Date().toDateString();
      return store.tasks().filter(task => 
        task.dueDate && new Date(task.dueDate).toDateString() === today
      );
    }),
    
    overdueTasks: computed(() => {
      const now = new Date();
      return store.tasks().filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== TaskStatus.COMPLETED
      );
    }),
    
    tasksByEnergyLevel: computed(() => {
      const tasks = store.tasks();
      return {
        low: tasks.filter(t => t.energyLevel === TaskEnergyLevel.LOW),
        medium: tasks.filter(t => t.energyLevel === TaskEnergyLevel.MEDIUM),
        high: tasks.filter(t => t.energyLevel === TaskEnergyLevel.HIGH),
      };
    }),
    
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
    
    highPriorityTasks: computed(() => 
      store.tasks().filter(task => 
        task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT
      )
    ),
    
    averageFocusScore: computed(() => {
      const tasksWithFocus = store.tasks().filter(t => t.focusScore);
      if (tasksWithFocus.length === 0) return 0;
      return tasksWithFocus.reduce((sum, task) => sum + (task.focusScore || 0), 0) / tasksWithFocus.length;
    }),
    
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
  withMethods((store, httpClient = inject(HttpClient)) => ({
    async loadTasks(filters?: TaskFilter): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      
      try {
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
          `/api/tasks?${params}`
        ).toPromise();
        
        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to load tasks');
        }

        patchState(store, {
          tasks: [...(response.data || [])],
          filters: filters || {},
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
        patchState(store, {
          isLoading: false,
          error: errorMessage,
        });
      }
    },

    async createTask(taskData: CreateTaskDto): Promise<void> {
      if (!taskData.title?.trim()) {
        patchState(store, { error: 'Task title is required' });
        return;
      }

      patchState(store, { isCreating: true, error: null });
      
      try {
        const response = await httpClient.post<ApiResponse<Task>>(
          '/api/tasks',
          taskData
        ).toPromise();
        
        if (!response || !response.success || !response.data) {
          throw new Error(response?.message || 'Failed to create task');
        }

        patchState(store, {
          tasks: [response.data, ...store.tasks()],
          isCreating: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
        patchState(store, {
          isCreating: false,
          error: errorMessage,
        });
      }
    },

    async updateTask(taskId: string, updates: UpdateTaskDto): Promise<void> {
      if (!taskId?.trim()) {
        patchState(store, { error: 'Task ID is required for update' });
        return;
      }

      patchState(store, { isUpdating: true, error: null });
      
      try {
        const response = await httpClient.patch<ApiResponse<Task>>(
          `/api/tasks/${taskId}`,
          updates
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
        patchState(store, {
          isUpdating: false,
          error: errorMessage,
        });
      }
    },

    async deleteTask(taskId: string): Promise<void> {
      if (!taskId?.trim()) {
        patchState(store, { error: 'Task ID is required for deletion' });
        return;
      }

      try {
        const response = await httpClient.delete<ApiResponse<void>>(
          `/api/tasks/${taskId}`
        ).toPromise();
        
        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to delete task');
        }
        
        patchState(store, {
          tasks: store.tasks().filter(task => task.id !== taskId),
          selectedTask: store.selectedTask()?.id === taskId ? null : store.selectedTask(),
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
        patchState(store, { error: errorMessage });
      }
    },

    async loadTaskStats(): Promise<void> {
      try {
        const response = await httpClient.get<ApiResponse<TaskStats>>(
          '/api/tasks/stats'
        ).toPromise();
        
        if (response && response.success && response.data) {
          patchState(store, { stats: response.data });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load stats';
        patchState(store, { error: errorMessage });
      }
    },

    async startFocusSession(taskId: string): Promise<void> {
      patchState(store, { isFocusing: true, error: null });
      
      try {
        const response = await httpClient.post<ApiResponse<FocusSession>>(
          `/api/tasks/${taskId}/focus/start`,
          {}
        ).toPromise();
        
        if (!response || !response.success || !response.data) {
          throw new Error(response?.message || 'Failed to start focus session');
        }

        patchState(store, {
          activeFocusSession: response.data,
          isFocusing: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start focus session';
        patchState(store, {
          isFocusing: false,
          error: errorMessage,
        });
      }
    },

    async endFocusSession(sessionId: string, focusScore: number, distractions: number): Promise<void> {
      patchState(store, { isFocusing: true, error: null });
      
      try {
        const response = await httpClient.post<ApiResponse<FocusSession>>(
          `/api/tasks/focus/${sessionId}/end`,
          { focusScore, distractions }
        ).toPromise();
        
        if (!response || !response.success || !response.data) {
          throw new Error(response?.message || 'Failed to end focus session');
        }

        patchState(store, {
          activeFocusSession: null,
          focusSessions: [response.data, ...store.focusSessions()],
          isFocusing: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to end focus session';
        patchState(store, {
          isFocusing: false,
          error: errorMessage,
        });
      }
    },

    async quickCreateTask(
      title: string, 
      priority: TaskPriority = TaskPriority.MEDIUM,
      energyLevel: TaskEnergyLevel = TaskEnergyLevel.MEDIUM,
      estimatedDuration: number = 30
    ): Promise<void> {
      if (!title?.trim()) {
        patchState(store, { error: 'Task title is required' });
        return;
      }

      await this.createTask({
        title: title.trim(),
        priority,
        difficulty: 'medium' as any,
        estimatedDuration,
        tags: [],
        energyLevel,
      });
    },

    async toggleTaskStatus(taskId: string): Promise<void> {
      const task = store.tasks().find(t => t.id === taskId);
      if (!task) {
        patchState(store, { error: 'Task not found' });
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

    updateFilters(filters: TaskFilter): void {
      patchState(store, { filters });
      this.loadTasks(filters);
    },

    selectTask(task: Task | null): void {
      patchState(store, { selectedTask: task });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
); 