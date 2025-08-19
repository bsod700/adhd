import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { 
  UserRole, 
  UserPreferences, 
  AdhdProfile,
  TaskPriority,
  TaskDifficulty,
  TaskContext
} from '@adhd-dashboard/shared-types';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email!: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  password!: string;

  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName!: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName!: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @Column({ 
    type: 'varchar',
    enum: UserRole,
    default: UserRole.USER 
  })
  role!: UserRole;

  @ApiProperty({ description: 'Whether user account is active' })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'User preferences' })
  @Column({ 
    type: 'json', 
    default: JSON.stringify({
      theme: 'light',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        taskReminders: true,
        dailyDigest: true,
        focusBreaks: true,
        achievementCelebrations: true
      },
      dashboard: {
        defaultView: 'list',
        showStats: true,
        showQuickActions: true,
        compactMode: false,
        autoRefresh: true
      },
      taskDefaults: {
        defaultPriority: TaskPriority.MEDIUM,
        defaultDifficulty: TaskDifficulty.MEDIUM,
        defaultEstimatedDuration: 30,
        defaultContext: TaskContext.WORK,
        autoStartTimer: false
      }
    })
  })
  preferences!: UserPreferences;

  @ApiProperty({ description: 'ADHD-specific profile and settings' })
  @Column({ 
    type: 'json', 
    default: JSON.stringify({
      energyPattern: [],
      preferredWorkDuration: 25,
      preferredBreakDuration: 5,
      bestFocusTimeStart: '09:00',
      bestFocusTimeEnd: '11:00',
      distractionTriggers: [],
      motivationStrategies: ['progress_visualization'],
      sensoryPreferences: {
        preferredSounds: ['silence'],
        lightingPreference: 'natural',
        colorScheme: 'minimal',
        reduceAnimations: false
      }
    })
  })
  adhdProfile!: AdhdProfile;

  // Relations using string references to avoid circular imports
  @ManyToOne('Organization', 'users', { nullable: true })
  organization?: any;

  @OneToMany('Task', 'user')
  tasks!: any[];

  @OneToMany('FocusSession', 'user')
  focusSessions!: any[];
} 