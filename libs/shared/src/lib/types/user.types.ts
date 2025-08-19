export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly avatar?: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
  readonly organizationId?: string;
  readonly preferences: UserPreferences;
  readonly adhdProfile: AdhdProfile;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly timezone: string;
  readonly language: string;
  readonly notifications: NotificationPreferences;
  readonly dashboard: DashboardPreferences;
  readonly taskDefaults: TaskDefaultPreferences;
}

export interface NotificationPreferences {
  readonly email: boolean;
  readonly push: boolean;
  readonly taskReminders: boolean;
  readonly dailyDigest: boolean;
  readonly focusBreaks: boolean;
  readonly achievementCelebrations: boolean;
}

export interface DashboardPreferences {
  readonly defaultView: 'list' | 'kanban' | 'calendar' | 'timeline';
  readonly showStats: boolean;
  readonly showQuickActions: boolean;
  readonly compactMode: boolean;
  readonly autoRefresh: boolean;
}

export interface TaskDefaultPreferences {
  readonly defaultPriority: import('./task.types').TaskPriority;
  readonly defaultDifficulty: import('./task.types').TaskDifficulty;
  readonly defaultEstimatedDuration: number;
  readonly defaultContext: import('./task.types').TaskContext;
  readonly autoStartTimer: boolean;
}

// ADHD-specific profile and preferences
export interface AdhdProfile {
  readonly energyPattern: EnergyPattern[];
  readonly preferredWorkDuration: number; // in minutes
  readonly preferredBreakDuration: number; // in minutes
  readonly bestFocusTimeStart: string; // HH:mm format
  readonly bestFocusTimeEnd: string; // HH:mm format
  readonly distractionTriggers: readonly string[];
  readonly motivationStrategies: readonly MotivationStrategy[];
  readonly sensoryPreferences: SensoryPreferences;
}

export interface EnergyPattern {
  readonly dayOfWeek: number; // 0-6 (Sunday = 0)
  readonly timeSlots: TimeSlot[];
}

export interface TimeSlot {
  readonly startTime: string; // HH:mm
  readonly endTime: string; // HH:mm
  readonly energyLevel: 'low' | 'medium' | 'high';
}

export enum MotivationStrategy {
  GAMIFICATION = 'gamification',
  SOCIAL_ACCOUNTABILITY = 'social_accountability',
  IMMEDIATE_REWARDS = 'immediate_rewards',
  PROGRESS_VISUALIZATION = 'progress_visualization',
  DEADLINE_PRESSURE = 'deadline_pressure',
  VARIETY_AND_NOVELTY = 'variety_and_novelty'
}

export interface SensoryPreferences {
  readonly preferredSounds: readonly string[]; // 'silence', 'white_noise', 'nature', 'music'
  readonly lightingPreference: 'bright' | 'dim' | 'natural';
  readonly colorScheme: 'high_contrast' | 'soft_colors' | 'minimal';
  readonly reduceAnimations: boolean;
}

export interface CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly organizationId?: string;
}

export interface UpdateUserDto {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly avatar?: string;
  readonly preferences?: Partial<UserPreferences>;
  readonly adhdProfile?: Partial<AdhdProfile>;
}

export interface UserStats {
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly totalFocusTime: number; // in minutes
  readonly avgFocusScore: number;
  readonly streak: number; // consecutive days with completed tasks
  readonly level: number; // gamification level
  readonly experience: number; // experience points
  readonly achievements: readonly string[];
} 