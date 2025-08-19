import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { 
  OrganizationSettings, 
  SubscriptionInfo, 
  SubscriptionPlan, 
  SubscriptionStatus 
} from '@adhd-dashboard/shared-types';

@Entity('organizations')
export class Organization extends BaseEntity {
  @ApiProperty({ description: 'Organization name' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'Organization description', required: false })
  @Column({ nullable: true, type: 'text' })
  description?: string;

  @ApiProperty({ description: 'Organization domain', required: false })
  @Column({ nullable: true })
  domain?: string;

  @ApiProperty({ description: 'Organization subdomain', required: false })
  @Column({ nullable: true, unique: true })
  subdomain?: string;

  @ApiProperty({ description: 'Organization logo URL', required: false })
  @Column({ nullable: true })
  logo?: string;

  @ApiProperty({ description: 'Organization settings' })
  @Column({ 
    type: 'json', 
    default: JSON.stringify({
      features: {
        aiSuggestions: true,
        advancedAnalytics: false,
        customIntegrations: false,
        ssoEnabled: false,
        auditLogs: false,
        customRoles: false
      },
      limits: {
        maxUsers: 10,
        maxTasksPerUser: 100,
        maxStorageGB: 1,
        maxAiRequestsPerMonth: 1000,
        maxIntegrations: 3
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B',
        logoUrl: null,
        faviconUrl: null,
        customCss: null
      },
      integrations: {},
      allowUserRegistration: true,
      defaultUserRole: 'user'
    })
  })
  settings!: OrganizationSettings;

  @ApiProperty({ description: 'Subscription information' })
  @Column({ 
    type: 'json', 
    default: JSON.stringify({
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: null,
      trialEndsAt: null,
      isTrialActive: false,
      nextBillingDate: null,
      pricePerMonth: 0,
      features: ['basic_tasks', 'basic_ai']
    })
  })
  subscription!: SubscriptionInfo;

  @ApiProperty({ description: 'Whether organization is active' })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Current number of users' })
  @Column({ default: 0 })
  userCount!: number;

  @ApiProperty({ description: 'Admin user IDs' })
  @Column({ type: 'json', default: '[]' })
  adminIds!: string[];

  // Relations
  @OneToMany('User', 'organization')
  users!: any[];
} 