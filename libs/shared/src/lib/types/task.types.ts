export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly difficulty: TaskDifficulty;
  readonly estimatedDuration: number; // in minutes
  readonly actualDuration?: number; // in minutes
  readonly tags: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly dueDate?: Date;
  readonly completedAt?: Date;
  readonly userId: string;
  readonly parentTaskId?: string;
  readonly subtasks: readonly Task[];
  readonly focusScore?: number; // 1-10 scale for ADHD focus tracking
  readonly energyLevel?: TaskEnergyLevel;
  readonly context?: TaskContext;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard'
}

export enum TaskEnergyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskContext {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  LEARNING = 'learning',
  CREATIVE = 'creative',
  SOCIAL = 'social'
}

export interface CreateTaskDto {
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly difficulty: TaskDifficulty;
  readonly estimatedDuration: number;
  readonly tags: readonly string[];
  readonly dueDate?: Date;
  readonly parentTaskId?: string;
  readonly energyLevel?: TaskEnergyLevel;
  readonly context?: TaskContext;
}

export interface UpdateTaskDto {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly difficulty?: TaskDifficulty;
  readonly estimatedDuration?: number;
  readonly actualDuration?: number;
  readonly tags?: readonly string[];
  readonly dueDate?: Date;
  readonly focusScore?: number;
  readonly energyLevel?: TaskEnergyLevel;
  readonly context?: TaskContext;
}

export interface TaskFilter {
  readonly status?: TaskStatus[];
  readonly priority?: TaskPriority[];
  readonly tags?: readonly string[];
  readonly dueDateFrom?: Date;
  readonly dueDateTo?: Date;
  readonly context?: TaskContext[];
  readonly search?: string;
}

export interface TaskSortOptions {
  readonly field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'difficulty' | 'estimatedDuration';
  readonly direction: 'asc' | 'desc';
}

export interface TaskStats {
  readonly total: number;
  readonly completed: number;
  readonly inProgress: number;
  readonly overdue: number;
  readonly completionRate: number;
  readonly avgFocusScore: number;
  readonly totalTimeSpent: number; // in minutes
  readonly avgCompletionTime: number; // in minutes
}

// For ADHD-specific features
export interface FocusSession {
  readonly id: string;
  readonly taskId: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration: number; // in minutes
  readonly focusScore: number; // 1-10
  readonly distractions: number;
  readonly userId: string;
}

export interface TaskRecommendation {
  readonly taskId: string;
  readonly reason: string;
  readonly confidence: number; // 0-1
  readonly suggestedTime: Date;
  readonly estimatedFocusScore: number;
} 