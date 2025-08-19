import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { 
  TaskStatus,
  TaskStats,
  PaginatedResponse,
  ApiResponse
} from '@adhd-dashboard/shared-types';
import { Task } from './entities/task.entity';
import { FocusSession } from './entities/focus-session.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(FocusSession)
    private focusSessionRepository: Repository<FocusSession>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<ApiResponse<Task>> {
    try {
      // Validate parent task if provided
      if (createTaskDto.parentTaskId) {
        const parentTask = await this.taskRepository.findOne({
          where: { id: createTaskDto.parentTaskId, userId }
        });
        if (!parentTask) {
          throw new BadRequestException('Parent task not found');
        }
      }

      const taskData: any = {
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        difficulty: createTaskDto.difficulty,
        estimatedDuration: createTaskDto.estimatedDuration,
        tags: [...createTaskDto.tags],
        userId,
        parentTaskId: createTaskDto.parentTaskId,
        energyLevel: createTaskDto.energyLevel,
        context: createTaskDto.context
      }
      
      if (createTaskDto.dueDate) {
        taskData.dueDate = new Date(createTaskDto.dueDate);
      }
      
      const task = this.taskRepository.create(taskData);

      const savedTask = await this.taskRepository.save(task);

      return {
        success: true,
        data: Array.isArray(savedTask) ? savedTask[0]! : savedTask,
        message: 'Task created successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async findAll(
    userId: string,
    filters: TaskFilterDto
  ): Promise<PaginatedResponse<Task>> {
    const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    // Apply filters
    if (filters.status?.length) {
      queryBuilder.andWhere('task.status IN (:...status)', { status: filters.status });
    }

    if (filters.priority?.length) {
      queryBuilder.andWhere('task.priority IN (:...priority)', { priority: filters.priority });
    }

    if (filters.context?.length) {
      queryBuilder.andWhere('task.context IN (:...context)', { context: filters.context });
    }

    if (filters.tags?.length) {
      // SQLite JSON search
      const tagConditions = filters.tags.map((_tag, index) => 
        `JSON_EXTRACT(task.tags, '$') LIKE :tag${index}`
      );
      queryBuilder.andWhere(`(${tagConditions.join(' OR ')})`, 
        filters.tags.reduce((acc, tag, index) => ({
          ...acc,
          [`tag${index}`]: `%"${tag}"%`
        }), {})
      );
    }

    if (filters.dueDateFrom) {
      queryBuilder.andWhere('task.dueDate >= :fromDate', { 
        fromDate: new Date(filters.dueDateFrom) 
      });
    }

    if (filters.dueDateTo) {
      queryBuilder.andWhere('task.dueDate <= :toDate', { 
        toDate: new Date(filters.dueDateTo) 
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Add sorting
    const validSortFields = ['title', 'priority', 'dueDate', 'createdAt', 'difficulty', 'estimatedDuration'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`task.${safeSortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get data
    const tasks = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .getMany();

    return {
      success: true,
      data: tasks,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrevious: page > 1
      }
    };
  }

  async findOne(id: string, userId: string): Promise<ApiResponse<Task>> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, userId },
        relations: ['subtasks', 'parentTask'],
      });

      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
      }

      return {
        success: true,
        data: task
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<ApiResponse<Task>> {
    try {
      const taskResult = await this.findOne(id, userId);
      if (!taskResult.success) {
        return taskResult;
      }

      const task = taskResult.data!;
      const updateData: Partial<Task> = {};

      // Copy allowed fields
      if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
      if (updateTaskDto.status !== undefined) updateData.status = updateTaskDto.status;
      if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
      if (updateTaskDto.difficulty !== undefined) updateData.difficulty = updateTaskDto.difficulty;
      if (updateTaskDto.estimatedDuration !== undefined) updateData.estimatedDuration = updateTaskDto.estimatedDuration;
      if (updateTaskDto.actualDuration !== undefined) updateData.actualDuration = updateTaskDto.actualDuration;
      if (updateTaskDto.focusScore !== undefined) updateData.focusScore = updateTaskDto.focusScore;
      if (updateTaskDto.energyLevel !== undefined) updateData.energyLevel = updateTaskDto.energyLevel;
      if (updateTaskDto.context !== undefined) updateData.context = updateTaskDto.context;

      // Update completion timestamp if status changes to completed
      if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      // Convert date string to Date object
      if (updateTaskDto.dueDate) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      // Convert readonly array to mutable array
      if (updateTaskDto.tags) {
        updateData.tags = [...updateTaskDto.tags];
      }

      await this.taskRepository.update(id, updateData);
      
      const updatedTaskResult = await this.findOne(id, userId);
      if (!updatedTaskResult.success || !updatedTaskResult.data) {
        return {
          success: false,
          message: 'Failed to retrieve updated task'
        };
      }
      return {
        success: true,
        data: updatedTaskResult.data,
        message: 'Task updated successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async remove(id: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const taskResult = await this.findOne(id, userId);
      if (!taskResult.success) {
        return {
          success: false,
          message: 'Task not found'
        };
      }

      await this.taskRepository.remove(taskResult.data!);
      
      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async getStats(userId: string): Promise<ApiResponse<TaskStats>> {
    try {
      const [total, completed, inProgress, overdue] = await Promise.all([
        this.taskRepository.count({ where: { userId } }),
        this.taskRepository.count({ 
          where: { userId, status: TaskStatus.COMPLETED } 
        }),
        this.taskRepository.count({ 
          where: { userId, status: TaskStatus.IN_PROGRESS } 
        }),
        this.taskRepository
          .createQueryBuilder('task')
          .where('task.userId = :userId', { userId })
          .andWhere('task.dueDate < :now', { now: new Date() })
          .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
          .getCount(),
      ]);

      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Calculate focus score statistics
      const focusScoreTasks = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .andWhere('task.focusScore IS NOT NULL')
        .getMany();

      const avgFocusScore = focusScoreTasks.length > 0 
        ? focusScoreTasks.reduce((sum, task) => sum + (task.focusScore || 0), 0) / focusScoreTasks.length
        : 0;

      // Calculate time statistics
      const completedTasks = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .andWhere('task.status = :completed', { completed: TaskStatus.COMPLETED })
        .andWhere('task.actualDuration IS NOT NULL')
        .getMany();

      const totalTimeSpent = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
      const avgCompletionTime = completedTasks.length > 0 
        ? totalTimeSpent / completedTasks.length 
        : 0;

      const stats: TaskStats = {
        total,
        completed,
        inProgress,
        overdue,
        completionRate,
        avgFocusScore,
        totalTimeSpent,
        avgCompletionTime,
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task statistics';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // ADHD-specific features
  async startFocusSession(taskId: string, userId: string): Promise<ApiResponse<FocusSession>> {
    try {
      const taskResult = await this.findOne(taskId, userId);
      if (!taskResult.success) {
        return {
          success: false,
          message: 'Task not found'
        };
      }

      const focusSession = this.focusSessionRepository.create({
        taskId,
        userId,
        startTime: new Date(),
        duration: 0,
        focusScore: 5, // Default middle score
        distractions: 0
      });

      const savedSession = await this.focusSessionRepository.save(focusSession);

      return {
        success: true,
        data: savedSession,
        message: 'Focus session started'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start focus session';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async endFocusSession(
    sessionId: string, 
    userId: string, 
    focusScore: number, 
    distractions: number
  ): Promise<ApiResponse<FocusSession>> {
    try {
      const session = await this.focusSessionRepository.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return {
          success: false,
          message: 'Focus session not found'
        };
      }

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60)); // minutes

      await this.focusSessionRepository.update(sessionId, {
        endTime,
        duration,
        focusScore,
        distractions
      });

      // Update task with focus score if it's higher than current
      const task = await this.taskRepository.findOne({
        where: { id: session.taskId, userId }
      });

      if (task && (!task.focusScore || focusScore > task.focusScore)) {
        await this.taskRepository.update(task.id, { focusScore });
      }

      const updatedSession = await this.focusSessionRepository.findOne({
        where: { id: sessionId }
      });

      return {
        success: true,
        data: updatedSession!,
        message: 'Focus session completed'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end focus session';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async getTasksByEnergyLevel(userId: string, energyLevel: string): Promise<ApiResponse<Task[]>> {
    try {
      const tasks = await this.taskRepository.find({
        where: { 
          userId, 
          energyLevel: energyLevel as any,
          status: TaskStatus.TODO 
        },
        order: { priority: 'DESC', dueDate: 'ASC' }
      });

      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks by energy level';
      return {
        success: false,
        message: errorMessage
      };
    }
  }
} 