import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsDateString,
  Min,
  Max,
  ArrayMaxSize
} from 'class-validator';

import { 
  TaskPriority, 
  TaskDifficulty, 
  TaskEnergyLevel, 
  TaskContext 
} from '@adhd-dashboard/shared-types';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  readonly title!: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority })
  @IsEnum(TaskPriority)
  readonly priority!: TaskPriority;

  @ApiProperty({ description: 'Task difficulty for ADHD users', enum: TaskDifficulty })
  @IsEnum(TaskDifficulty)
  readonly difficulty!: TaskDifficulty;

  @ApiProperty({ description: 'Estimated duration in minutes', minimum: 1, maximum: 480 })
  @IsNumber()
  @Min(1)
  @Max(480) // Max 8 hours
  readonly estimatedDuration!: number;

  @ApiProperty({ description: 'Task tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  readonly tags!: readonly string[];

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @ApiProperty({ description: 'Parent task ID for subtasks', required: false })
  @IsOptional()
  @IsString()
  readonly parentTaskId?: string;

  @ApiProperty({ description: 'Energy level required', enum: TaskEnergyLevel, required: false })
  @IsOptional()
  @IsEnum(TaskEnergyLevel)
  readonly energyLevel?: TaskEnergyLevel;

  @ApiProperty({ description: 'Task context/category', enum: TaskContext, required: false })
  @IsOptional()
  @IsEnum(TaskContext)
  readonly context?: TaskContext;
} 