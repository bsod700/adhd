export interface Organization {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly domain?: string;
  readonly logo?: string;
  readonly settings: OrganizationSettings;
  readonly subscription: SubscriptionInfo;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isActive: boolean;
  readonly userCount: number;
  readonly adminIds: readonly string[];
}

export interface OrganizationSettings {
  readonly features: OrganizationFeatures;
  readonly limits: OrganizationLimits;
  readonly branding: BrandingSettings;
  readonly integrations: IntegrationSettings;
}

export interface OrganizationFeatures {
  readonly aiSuggestions: boolean;
  readonly advancedAnalytics: boolean;
  readonly customIntegrations: boolean;
  readonly ssoEnabled: boolean;
  readonly auditLogs: boolean;
  readonly customRoles: boolean;
}

export interface OrganizationLimits {
  readonly maxUsers: number;
  readonly maxTasksPerUser: number;
  readonly maxStorageGB: number;
  readonly maxAiRequestsPerMonth: number;
  readonly maxIntegrations: number;
}

export interface BrandingSettings {
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly logoUrl?: string;
  readonly faviconUrl?: string;
  readonly customCss?: string;
}

export interface IntegrationSettings {
  readonly slack?: SlackIntegration;
  readonly microsoft?: MicrosoftIntegration;
  readonly google?: GoogleIntegration;
  readonly zapier?: ZapierIntegration;
}

export interface SlackIntegration {
  readonly enabled: boolean;
  readonly webhookUrl?: string;
  readonly channels: readonly string[];
}

export interface MicrosoftIntegration {
  readonly enabled: boolean;
  readonly tenantId?: string;
  readonly clientId?: string;
}

export interface GoogleIntegration {
  readonly enabled: boolean;
  readonly clientId?: string;
  readonly calendarSync: boolean;
}

export interface ZapierIntegration {
  readonly enabled: boolean;
  readonly webhookUrl?: string;
}

export interface SubscriptionInfo {
  readonly plan: SubscriptionPlan;
  readonly status: SubscriptionStatus;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly trialEndsAt?: Date;
  readonly isTrialActive: boolean;
  readonly nextBillingDate?: Date;
  readonly pricePerMonth: number;
  readonly features: readonly string[];
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid'
}

export interface CreateOrganizationDto {
  readonly name: string;
  readonly description?: string;
  readonly domain?: string;
  readonly adminEmail: string;
  readonly plan: SubscriptionPlan;
}

export interface UpdateOrganizationDto {
  readonly name?: string;
  readonly description?: string;
  readonly domain?: string;
  readonly logo?: string;
  readonly settings?: Partial<OrganizationSettings>;
}

export interface OrganizationStats {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly avgTasksPerUser: number;
  readonly avgCompletionRate: number;
  readonly storageUsedGB: number;
  readonly aiRequestsThisMonth: number;
}

export interface OrganizationInvite {
  readonly id: string;
  readonly organizationId: string;
  readonly email: string;
  readonly role: import('./auth.types').UserRole;
  readonly invitedBy: string;
  readonly invitedAt: Date;
  readonly expiresAt: Date;
  readonly acceptedAt?: Date;
  readonly status: InviteStatus;
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export interface SendInviteDto {
  readonly email: string;
  readonly role: import('./auth.types').UserRole;
  readonly message?: string;
} 