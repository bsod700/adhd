export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly errors?: readonly ValidationError[];
  readonly meta?: ResponseMeta;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<readonly T[]> {
  readonly pagination: PaginationInfo;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

export interface ResponseMeta {
  readonly timestamp: string;
  readonly requestId: string;
  readonly version: string;
}

export interface PaginationInfo {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface PaginationRequest {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface ErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
  readonly meta?: ResponseMeta;
}

// Standard HTTP status codes used in the app
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// API endpoint paths
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    STATS: '/tasks/stats'
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences'
  },
  AI: {
    SUGGESTIONS: '/ai/suggestions',
    REORDER: '/ai/reorder',
    INSIGHTS: '/ai/insights',
    BREAKDOWN: '/ai/breakdown'
  },
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings'
  }
} as const;

// Query parameter types for API calls
export interface TaskQuery extends PaginationRequest {
  readonly status?: readonly string[];
  readonly priority?: readonly string[];
  readonly tags?: readonly string[];
  readonly search?: string;
  readonly dueFrom?: string;
  readonly dueTo?: string;
}

export interface UserQuery extends PaginationRequest {
  readonly role?: string;
  readonly isActive?: boolean;
  readonly search?: string;
  readonly organizationId?: string;
}

// WebSocket message types
export interface WebSocketMessage<T = unknown> {
  readonly type: string;
  readonly data: T;
  readonly timestamp: string;
  readonly userId?: string;
}

export enum WebSocketEventType {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  USER_UPDATED = 'user:updated',
  AI_SUGGESTION = 'ai:suggestion',
  NOTIFICATION = 'notification'
} 