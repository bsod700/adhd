// Export all shared types with explicit handling of conflicts
export * from './lib/types/api.types';
export * from './lib/types/task.types';

// Export common types (just BaseEntity, UserRole comes from auth)
export type { BaseEntity } from './lib/types/common.types';

// Export user types except UserRole (to avoid conflict with auth.types)
export type {
  User,
  UserPreferences,
  AdhdProfile,
  EnergyPattern,
  TimeSlot,
  MotivationStrategy,
  SensoryPreferences,
  CreateUserDto,
  UpdateUserDto,
  UserStats,
  NotificationPreferences,
  DashboardPreferences,
  TaskDefaultPreferences
} from './lib/types/user.types';

// Export auth types (includes UserRole)
export * from './lib/types/auth.types';

export * from './lib/types/ai.types';
export * from './lib/types/organization.types';
