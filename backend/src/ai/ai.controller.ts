import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AiService } from './ai.service';
import { AiSuggestionRequestDto } from './dto/ai-suggestion-request.dto';
import { TaskReorderRequestDto } from './dto/task-reorder-request.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Generate ADHD-specific AI suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions generated successfully' })
  @Post('suggestions')
  async generateSuggestions(
    @Body() requestDto: AiSuggestionRequestDto,
    @Request() req: any
  ) {
    return this.aiService.generateSuggestions(requestDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get AI-powered task reordering suggestions' })
  @ApiResponse({ status: 200, description: 'Task reorder suggestions generated successfully' })
  @Post('reorder')
  async reorderTasks(
    @Body() reorderDto: TaskReorderRequestDto,
    @Request() req: any
  ) {
    return this.aiService.reorderTasks(reorderDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get productivity insights based on ADHD patterns' })
  @ApiResponse({ status: 200, description: 'Productivity insights generated successfully' })
  @Get('insights')
  async getProductivityInsights(@Request() req: any) {
    return this.aiService.getProductivityInsights(req.user.id);
  }
} 