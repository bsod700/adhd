import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all tasks with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @Get()
  async findAll(@Request() req: any, @Query() filters: TaskFilterDto) {
    return this.tasksService.findAll(req.user.id, filters);
  }

  @ApiOperation({ summary: 'Get task statistics for ADHD dashboard' })
  @ApiResponse({ status: 200, description: 'Task stats retrieved successfully' })
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.tasksService.getStats(req.user.id);
  }

  @ApiOperation({ summary: 'Get tasks by energy level (ADHD feature)' })
  @ApiResponse({ status: 200, description: 'Tasks filtered by energy level' })
  @Get('energy/:level')
  async getTasksByEnergyLevel(
    @Param('level') level: string,
    @Request() req: any
  ) {
    return this.tasksService.getTasksByEnergyLevel(req.user.id, level);
  }

  @ApiOperation({ summary: 'Start focus session for a task (ADHD feature)' })
  @ApiResponse({ status: 201, description: 'Focus session started' })
  @Post(':id/focus/start')
  async startFocusSession(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.startFocusSession(id, req.user.id);
  }

  @ApiOperation({ summary: 'End focus session (ADHD feature)' })
  @ApiResponse({ status: 200, description: 'Focus session ended' })
  @Post('focus/:sessionId/end')
  async endFocusSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { focusScore: number; distractions: number },
    @Request() req: any
  ) {
    return this.tasksService.endFocusSession(
      sessionId, 
      req.user.id, 
      body.focusScore, 
      body.distractions
    );
  }

  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }
} 