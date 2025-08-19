import { TaskStatus, TaskPriority } from '@adhd-dashboard/shared-types';

// Re-export the types so they can be used by other modules
export { TaskStatus, TaskPriority };

export interface DashboardStats {
  readonly todayTasks: number;
  readonly completed: number;
  readonly overdue: number;
  readonly focusScore: number;
  readonly totalTasks: number;
  readonly completionRate: number;
}

export interface RecentTask {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate?: Date;
}

export interface AiSuggestion {
  readonly id: string;
  readonly type: SuggestionType;
  readonly message: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly actionable: boolean;
}

export enum SuggestionType {
  BREAK = 'break',
  TASK_BREAKDOWN = 'task_breakdown',
  PRIORITIZATION = 'prioritization',
  REMINDER = 'reminder'
}

export interface FocusSession {
  readonly id: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly taskId?: string;
  readonly duration?: number;
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

export enum LoadingState {
  READY = 'ready',
  LOADING = 'loading',
  ERROR = 'error'
} 