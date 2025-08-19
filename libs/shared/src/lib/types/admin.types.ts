import { BaseEntity, UserRole } from './common.types';

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number; // percentage
  };
  organizations: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  tasks: {
    total: number;
    completedThisMonth: number;
    averageCompletionTime: number;
    completionRate: number;
  };
  ai: {
    suggestionsGenerated: number;
    acceptanceRate: number;
    topSuggestionTypes: Array<{
      type: string;
      count: number;
    }>;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    storageUsed: number;
  };
}

export interface SystemLog extends BaseEntity {
  level: LogLevel;
  message: string;
  source: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface AdminUser extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  taskCount: number;
  aiSuggestionsAccepted: number;
}

export interface AdminOrganization extends BaseEntity {
  name: string;
  subdomain: string;
  userCount: number;
  maxUsers: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  storageUsed: number;
  lastActivityAt: Date;
}

// DTOs
export interface AdminUserFilterDto {
  role?: UserRole[];
  isActive?: boolean;
  organizationId?: string;
  lastLoginAfter?: string;
  search?: string;
}

export interface AdminOrganizationFilterDto {
  subscriptionPlan?: string[];
  subscriptionStatus?: string[];
  isActive?: boolean;
  userCountMin?: number;
  userCountMax?: number;
  search?: string;
}

export interface SystemConfigDto {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic?: boolean;
}

export interface BulkActionDto {
  action: 'activate' | 'deactivate' | 'delete' | 'update';
  targetIds: string[];
  data?: Record<string, any>;
}

export interface SystemHealthDto {
  status: 'healthy' | 'degraded' | 'down';
  services: Array<{
    name: string;
    status: 'up' | 'down';
    responseTime?: number;
    lastCheck: Date;
  }>;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
} 