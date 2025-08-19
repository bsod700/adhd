import {
  DashboardStats,
  RecentTask,
  AiSuggestion,
  TaskStatus,
  TaskPriority,
  SuggestionType,
} from '../interfaces/dashboard.interface';

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  todayTasks: 8,
  completed: 5,
  overdue: 2,
  focusScore: 85,
  totalTasks: 15,
  completionRate: 0.67,
};

export const MOCK_RECENT_TASKS: RecentTask[] = [
  {
    id: '1',
    title: 'Review project proposal',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date('2024-03-25'),
  },
  {
    id: '2',
    title: 'Update documentation',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2024-03-26'),
  },
  {
    id: '3',
    title: 'Fix bug in authentication',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: new Date('2024-03-24'),
  },
];

export const MOCK_AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: '1',
    type: SuggestionType.BREAK,
    message: 'You\'ve been working for 2 hours. Consider taking a 15-minute break.',
    priority: 'medium',
    actionable: true,
  },
  {
    id: '2',
    type: SuggestionType.PRIORITIZATION,
    message: 'Based on your energy levels, tackle the high-priority tasks first.',
    priority: 'high',
    actionable: true,
  },
  {
    id: '3',
    type: SuggestionType.TASK_BREAKDOWN,
    message: 'Consider breaking down "Review project proposal" into smaller tasks.',
    priority: 'low',
    actionable: true,
  },
];

// Mock API response delays for realistic loading states
export const MOCK_API_DELAYS = {
  DASHBOARD_STATS: 800,
  RECENT_TASKS: 600,
  AI_SUGGESTIONS: 1200,
} as const;

// Mock error scenarios for testing
export const MOCK_ERROR_SCENARIOS = {
  NETWORK_ERROR: 'Network connection failed',
  AUTH_ERROR: 'Authentication expired',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_ERROR: 'Rate limit exceeded'
} as const; 