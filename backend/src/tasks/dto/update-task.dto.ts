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
  TaskStatus, 
  TaskPriority, 
  TaskDifficulty, 
  TaskEnergyLevel, 
  TaskContext 
} from '@adhd-dashboard/shared-types';

export class UpdateTaskDto {
  @ApiProperty({ description: 'Task title', required: false })
  @IsOptional()
  @IsString()
  readonly title?: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ description: 'Task status', enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @ApiProperty({ description: 'Task difficulty', enum: TaskDifficulty, required: false })
  @IsOptional()
  @IsEnum(TaskDifficulty)
  readonly difficulty?: TaskDifficulty;

  @ApiProperty({ description: 'Estimated duration in minutes', minimum: 1, maximum: 480, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  readonly estimatedDuration?: number;

  @ApiProperty({ description: 'Actual duration spent in minutes', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly actualDuration?: number;

  @ApiProperty({ description: 'Task tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  readonly tags?: readonly string[];

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @ApiProperty({ description: 'Focus score from 1-10', minimum: 1, maximum: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly focusScore?: number;

  @ApiProperty({ description: 'Energy level required', enum: TaskEnergyLevel, required: false })
  @IsOptional()
  @IsEnum(TaskEnergyLevel)
  readonly energyLevel?: TaskEnergyLevel;

  @ApiProperty({ description: 'Task context/category', enum: TaskContext, required: false })
  @IsOptional()
  @IsEnum(TaskContext)
  readonly context?: TaskContext;
} 