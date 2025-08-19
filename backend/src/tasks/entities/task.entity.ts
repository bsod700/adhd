import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskDifficulty, 
  TaskEnergyLevel, 
  TaskContext 
} from '@adhd-dashboard/shared-types';

@Entity('tasks')
export class Task extends BaseEntity {
  @ApiProperty({ description: 'Task title' })
  @Column()
  title!: string;

  @ApiProperty({ description: 'Task description', required: false })
  @Column({ nullable: true, type: 'text' })
  description?: string;

  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  @Column({ 
    type: 'varchar',
    enum: TaskStatus,
    default: TaskStatus.TODO 
  })
  status!: TaskStatus;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority })
  @Column({ 
    type: 'varchar',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM 
  })
  priority!: TaskPriority;

  @ApiProperty({ description: 'Task difficulty for ADHD users', enum: TaskDifficulty })
  @Column({ 
    type: 'varchar',
    enum: TaskDifficulty,
    default: TaskDifficulty.MEDIUM 
  })
  difficulty!: TaskDifficulty;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @Column()
  estimatedDuration!: number;

  @ApiProperty({ description: 'Actual duration spent in minutes', required: false })
  @Column({ nullable: true })
  actualDuration?: number;

  @ApiProperty({ description: 'Task tags' })
  @Column({ type: 'json', default: '[]' })
  tags!: string[];

  @ApiProperty({ description: 'Due date', required: false })
  @Column({ nullable: true })
  dueDate?: Date;

  @ApiProperty({ description: 'Task completion timestamp', required: false })
  @Column({ nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'User ID who owns this task' })
  @Column()
  userId!: string;

  @ApiProperty({ description: 'Parent task ID for subtasks', required: false })
  @Column({ nullable: true })
  parentTaskId?: string;

  @ApiProperty({ description: 'Focus score (1-10) for ADHD tracking', required: false })
  @Column({ nullable: true, type: 'int' })
  focusScore?: number;

  @ApiProperty({ description: 'Energy level required for this task', enum: TaskEnergyLevel, required: false })
  @Column({ 
    type: 'varchar',
    enum: TaskEnergyLevel,
    nullable: true 
  })
  energyLevel?: TaskEnergyLevel;

  @ApiProperty({ description: 'Task context/category', enum: TaskContext, required: false })
  @Column({ 
    type: 'varchar',
    enum: TaskContext,
    nullable: true 
  })
  context?: TaskContext;

  // Relations using string references to avoid circular imports
  @ManyToOne('User', 'tasks')
  user: any;

  @ManyToOne('Task', 'subtasks', { nullable: true })
  parentTask?: any;

  @OneToMany('Task', 'parentTask')
  subtasks!: any[];
} 