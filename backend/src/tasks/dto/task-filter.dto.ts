import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsString, 
  IsDateString, 
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskContext 
} from '@adhd-dashboard/shared-types';

export class TaskFilterDto {
  @ApiProperty({ description: 'Task statuses to filter by', enum: TaskStatus, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  readonly status?: TaskStatus[];

  @ApiProperty({ description: 'Task priorities to filter by', enum: TaskPriority, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskPriority, { each: true })
  readonly priority?: TaskPriority[];

  @ApiProperty({ description: 'Tags to filter by', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: readonly string[];

  @ApiProperty({ description: 'Due date from', required: false })
  @IsOptional()
  @IsDateString()
  readonly dueDateFrom?: string;

  @ApiProperty({ description: 'Due date to', required: false })
  @IsOptional()
  @IsDateString()
  readonly dueDateTo?: string;

  @ApiProperty({ description: 'Task contexts to filter by', enum: TaskContext, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskContext, { each: true })
  readonly context?: TaskContext[];

  @ApiProperty({ description: 'Search term for title and description', required: false })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiProperty({ description: 'Page number', minimum: 1, required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  readonly page?: number = 1;

  @ApiProperty({ description: 'Page size', minimum: 1, maximum: 100, required: false, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly pageSize?: number = 20;

  @ApiProperty({ description: 'Sort field', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  readonly sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort direction', enum: ['asc', 'desc'], required: false, default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'desc';
} 