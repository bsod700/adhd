import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('focus_sessions')
export class FocusSession extends BaseEntity {
  @ApiProperty({ description: 'Task ID this focus session is for' })
  @Column()
  taskId: string;

  @ApiProperty({ description: 'Focus session start time' })
  @Column()
  startTime: Date;

  @ApiProperty({ description: 'Focus session end time', required: false })
  @Column({ nullable: true })
  endTime?: Date;

  @ApiProperty({ description: 'Duration of focus session in minutes' })
  @Column()
  duration: number;

  @ApiProperty({ description: 'Focus score from 1-10' })
  @Column({ type: 'int' })
  focusScore: number;

  @ApiProperty({ description: 'Number of distractions during session' })
  @Column({ type: 'int', default: 0 })
  distractions: number;

  @ApiProperty({ description: 'User ID who performed this focus session' })
  @Column()
  userId: string;

  // Relations
  @ManyToOne('User', 'focusSessions')
  user: any;

  @ManyToOne('Task')
  task: any;
} 