import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  AiSuggestionResponse,
  AiSuggestion,
  SuggestionType,
  TaskReorderSuggestion,
  ProductivityInsight,
  InsightType,
  TaskStatus,
  TaskPriority,
  TaskEnergyLevel,
  ApiResponse
} from '@adhd-dashboard/shared-types';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { FocusSession } from '../tasks/entities/focus-session.entity';
import { AiSuggestionRequestDto } from './dto/ai-suggestion-request.dto';
import { TaskReorderRequestDto } from './dto/task-reorder-request.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FocusSession)
    private focusSessionRepository: Repository<FocusSession>,
  ) {}

  async generateSuggestions(
    dto: AiSuggestionRequestDto,
    userId: string
  ): Promise<ApiResponse<AiSuggestionResponse>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const tasks = await this.taskRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      const recentFocusSessions = await this.focusSessionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10
      });

      const suggestions = await this.generateAdhdSuggestions(
        user,
        tasks,
        recentFocusSessions,
        dto
      );

      const response: AiSuggestionResponse = {
        suggestions,
        confidence: 0.85,
        reasoning: 'Generated based on ADHD patterns, task history, and focus sessions',
        generatedAt: new Date()
      };

      return {
        success: true,
        data: response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI suggestions';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async reorderTasks(
    dto: TaskReorderRequestDto,
    userId: string
  ): Promise<ApiResponse<TaskReorderSuggestion>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const tasks = await this.taskRepository.findByIds([...dto.taskIds]);
      
      if (tasks.length !== dto.taskIds.length) {
        return {
          success: false,
          message: 'Some tasks not found'
        };
      }

      const reorderSuggestion = await this.generateTaskReorderSuggestion(
        user,
        tasks,
        dto.taskIds,
        new Date(dto.currentTime)
      );

      return {
        success: true,
        data: reorderSuggestion
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate task reorder suggestion';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async getProductivityInsights(userId: string): Promise<ApiResponse<ProductivityInsight[]>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const tasks = await this.taskRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      const focusSessions = await this.focusSessionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50
      });

      const insights = await this.generateProductivityInsights(user, tasks, focusSessions);

      return {
        success: true,
        data: insights
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate productivity insights';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  private async generateAdhdSuggestions(
    user: User,
    tasks: Task[],
    focusSessions: FocusSession[],
    dto: AiSuggestionRequestDto
  ): Promise<AiSuggestion[]> {
    const suggestions: AiSuggestion[] = [];
    const currentTime = new Date(dto.currentTime);
    const preferences = dto.preferences;

    // Task prioritization suggestions
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.TASK_PRIORITIZATION)) {
      const prioritizationSuggestion = this.generatePrioritizationSuggestion(tasks, user);
      if (prioritizationSuggestion) suggestions.push(prioritizationSuggestion);
    }

    // Optimal timing suggestions
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.OPTIMAL_TIMING)) {
      const timingSuggestion = this.generateOptimalTimingSuggestion(user, currentTime);
      if (timingSuggestion) suggestions.push(timingSuggestion);
    }

    // Task breakdown suggestions
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.TASK_BREAKDOWN)) {
      const breakdownSuggestion = this.generateTaskBreakdownSuggestion(tasks);
      if (breakdownSuggestion) suggestions.push(breakdownSuggestion);
    }

    // Focus strategies
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.FOCUS_STRATEGIES)) {
      const focusSuggestion = this.generateFocusStrategySuggestion(focusSessions, user);
      if (focusSuggestion) suggestions.push(focusSuggestion);
    }

    // Energy management
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.ENERGY_MANAGEMENT)) {
      const energySuggestion = this.generateEnergyManagementSuggestion(user, currentTime);
      if (energySuggestion) suggestions.push(energySuggestion);
    }

    // Motivation boost
    if (!preferences?.suggestionTypes || preferences.suggestionTypes.includes(SuggestionType.MOTIVATION_BOOST)) {
      const motivationSuggestion = this.generateMotivationSuggestion(tasks, user);
      if (motivationSuggestion) suggestions.push(motivationSuggestion);
    }

    const maxSuggestions = preferences?.maxSuggestions || 5;
    return suggestions.slice(0, maxSuggestions);
  }

  private generatePrioritizationSuggestion(tasks: Task[], _user: User): AiSuggestion | null {
    const overdueTasks = tasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.COMPLETED
    );

    const urgentTasks = tasks.filter(task =>
      task.priority === TaskPriority.URGENT && task.status !== TaskStatus.COMPLETED
    );

    if (overdueTasks.length > 0 || urgentTasks.length > 0) {
      return {
        id: `prioritization-${Date.now()}`,
        type: SuggestionType.TASK_PRIORITIZATION,
        title: 'Focus on urgent tasks first',
        description: `You have ${overdueTasks.length} overdue and ${urgentTasks.length} urgent tasks. Consider tackling these first to reduce stress.`,
        actionable: true,
        priority: 'high',
        estimatedImpact: 8,
        timeToImplement: 5,
        relatedTaskIds: [...overdueTasks.map(t => t.id), ...urgentTasks.map(t => t.id)],
        metadata: {
          contextualFactors: ['overdue_tasks', 'urgent_priority', 'stress_reduction'],
          alternatives: ['Delegate some tasks', 'Extend deadlines if possible']
        }
      };
    }

    return null;
  }

  private generateOptimalTimingSuggestion(user: User, currentTime: Date): AiSuggestion | null {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentHour * 60 + currentTime.getMinutes();
    
    const bestFocusStart = user.adhdProfile.bestFocusTimeStart;
    const bestFocusEnd = user.adhdProfile.bestFocusTimeEnd;
    
    const [startHour, startMin] = bestFocusStart.split(':').map(Number);
    const [endHour, endMin] = bestFocusEnd.split(':').map(Number);
    
    if (startHour === undefined || startMin === undefined || endHour === undefined || endMin === undefined) {
      return null;
    }
    
    const focusStartMinutes = startHour * 60 + startMin;
    const focusEndMinutes = endHour * 60 + endMin;

    if (currentMinutes >= focusStartMinutes && currentMinutes <= focusEndMinutes) {
      return {
        id: `timing-${Date.now()}`,
        type: SuggestionType.OPTIMAL_TIMING,
        title: 'Perfect time for focused work!',
        description: 'You\'re in your optimal focus window. This is a great time to tackle challenging tasks.',
        actionable: true,
        priority: 'high',
        estimatedImpact: 9,
        timeToImplement: 0,
        relatedTaskIds: [],
        metadata: {
          suggestedTime: currentTime,
          energyLevelRequired: TaskEnergyLevel.HIGH,
          contextualFactors: ['peak_focus_time', 'high_energy'],
          alternatives: ['Save easier tasks for later', 'Take advantage of high focus']
        }
      };
    }

    return null;
  }

  private generateTaskBreakdownSuggestion(tasks: Task[]): AiSuggestion | null {
    const largeTasks = tasks.filter(task => 
      task.estimatedDuration > 60 && 
      task.status === TaskStatus.TODO && 
      (!task.subtasks || task.subtasks.length === 0)
    );

    if (largeTasks.length > 0) {
      const task = largeTasks[0];
      if (!task) return null;
      
      return {
        id: `breakdown-${Date.now()}`,
        type: SuggestionType.TASK_BREAKDOWN,
        title: 'Break down large tasks',
        description: `"${task.title}" is estimated to take ${task.estimatedDuration} minutes. Breaking it into smaller chunks can make it feel less overwhelming.`,
        actionable: true,
        priority: 'medium',
        estimatedImpact: 7,
        timeToImplement: 10,
        relatedTaskIds: [task.id],
        metadata: {
          contextualFactors: ['large_task', 'adhd_overwhelm', 'task_management'],
          alternatives: ['Set a timer for focused work', 'Find an accountability partner']
        }
      };
    }

    return null;
  }

  private generateFocusStrategySuggestion(focusSessions: FocusSession[], _user: User): AiSuggestion | null {
    if (focusSessions.length === 0) {
      return {
        id: `focus-${Date.now()}`,
        type: SuggestionType.FOCUS_STRATEGIES,
        title: 'Start tracking your focus',
        description: 'Begin using focus sessions to understand your concentration patterns and improve over time.',
        actionable: true,
        priority: 'medium',
        estimatedImpact: 6,
        timeToImplement: 2,
        relatedTaskIds: [],
        metadata: {
          contextualFactors: ['no_focus_data', 'self_awareness', 'habit_building'],
          alternatives: ['Use the Pomodoro Technique', 'Try different focus methods']
        }
      };
    }

    const avgFocusScore = focusSessions.reduce((sum, session) => sum + session.focusScore, 0) / focusSessions.length;
    const avgDistractions = focusSessions.reduce((sum, session) => sum + session.distractions, 0) / focusSessions.length;

    if (avgFocusScore < 5 || avgDistractions > 3) {
      return {
        id: `focus-improve-${Date.now()}`,
        type: SuggestionType.FOCUS_STRATEGIES,
        title: 'Improve your focus environment',
        description: `Your average focus score is ${avgFocusScore.toFixed(1)} with ${avgDistractions.toFixed(1)} distractions per session. Try adjusting your environment.`,
        actionable: true,
        priority: 'medium',
        estimatedImpact: 7,
        timeToImplement: 15,
        relatedTaskIds: [],
        metadata: {
          contextualFactors: ['low_focus_score', 'high_distractions', 'environment_optimization'],
          alternatives: ['Change workspace', 'Use noise-canceling headphones', 'Turn off notifications']
        }
      };
    }

    return null;
  }

  private generateEnergyManagementSuggestion(user: User, currentTime: Date): AiSuggestion | null {
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();
    
    const todayPattern = user.adhdProfile.energyPattern.find(pattern => pattern.dayOfWeek === currentDay);
    
    if (todayPattern) {
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      const currentSlot = todayPattern.timeSlots.find(slot => 
        currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime
      );

      if (currentSlot && currentSlot.energyLevel === 'low') {
        return {
          id: `energy-${Date.now()}`,
          type: SuggestionType.ENERGY_MANAGEMENT,
          title: 'Low energy time - choose easier tasks',
          description: 'Based on your energy pattern, this is typically a low-energy time. Consider working on routine or administrative tasks.',
          actionable: true,
          priority: 'medium',
          estimatedImpact: 6,
          timeToImplement: 0,
          relatedTaskIds: [],
          metadata: {
            energyLevelRequired: TaskEnergyLevel.LOW,
            contextualFactors: ['low_energy_period', 'energy_optimization', 'task_matching'],
            alternatives: ['Take a short walk', 'Do some light stretching', 'Have a healthy snack']
          }
        };
      }
    }

    return null;
  }

  private generateMotivationSuggestion(tasks: Task[], _user: User): AiSuggestion | null {
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    if (completionRate > 70) {
      return {
        id: `motivation-${Date.now()}`,
        type: SuggestionType.MOTIVATION_BOOST,
        title: 'You\'re doing great!',
        description: `Amazing work! You've completed ${completionRate.toFixed(0)}% of your tasks. Keep up the momentum!`,
        actionable: false,
        priority: 'low',
        estimatedImpact: 5,
        timeToImplement: 0,
        relatedTaskIds: [],
        metadata: {
          contextualFactors: ['high_completion_rate', 'positive_reinforcement', 'momentum'],
          alternatives: ['Celebrate your progress', 'Share your success with others']
        }
      };
    } else if (completionRate < 30) {
      return {
        id: `motivation-encourage-${Date.now()}`,
        type: SuggestionType.MOTIVATION_BOOST,
        title: 'Small steps lead to big changes',
        description: 'Starting can be the hardest part. Pick one small task and build momentum from there.',
        actionable: true,
        priority: 'medium',
        estimatedImpact: 6,
        timeToImplement: 5,
        relatedTaskIds: [],
        metadata: {
          contextualFactors: ['low_completion_rate', 'motivation_boost', 'small_wins'],
          alternatives: ['Set a 5-minute timer', 'Choose the easiest task first', 'Ask for support']
        }
      };
    }

    return null;
  }

  private async generateTaskReorderSuggestion(
    _user: User,
    tasks: Task[],
    originalOrder: readonly string[],
    currentTime: Date
  ): Promise<TaskReorderSuggestion> {
    // Simple reordering logic based on ADHD principles
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    
    const reorderedTasks = [...originalOrder].sort((aId, bId) => {
      const taskA = taskMap.get(aId);
      const taskB = taskMap.get(bId);
      
      if (!taskA || !taskB) return 0;

      // Priority weights
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      let scoreA = priorityWeight[taskA.priority] || 0;
      let scoreB = priorityWeight[taskB.priority] || 0;

      // Due date urgency (closer dates get higher scores)
      if (taskA.dueDate) {
        const daysUntilDueA = Math.max(0, (taskA.dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
        scoreA += Math.max(0, 5 - daysUntilDueA);
      }
      
      if (taskB.dueDate) {
        const daysUntilDueB = Math.max(0, (taskB.dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
        scoreB += Math.max(0, 5 - daysUntilDueB);
      }

      // Energy level matching (prefer tasks that match current energy)
      const currentHour = currentTime.getHours();
      if (currentHour >= 9 && currentHour <= 11) { // Typical high energy time
        if (taskA.energyLevel === TaskEnergyLevel.HIGH) scoreA += 2;
        if (taskB.energyLevel === TaskEnergyLevel.HIGH) scoreB += 2;
      }

      return scoreB - scoreA;
    });

    return {
      originalOrder,
      suggestedOrder: reorderedTasks,
      reasoning: [
        {
          taskId: reorderedTasks[0] || '',
          reason: 'High priority and due soon',
          factorsConsidered: ['priority', 'due_date', 'energy_level']
        }
      ],
      estimatedProductivityGain: 15
    };
  }

  private async generateProductivityInsights(
    _user: User,
    tasks: Task[],
    focusSessions: FocusSession[]
  ): Promise<ProductivityInsight[]> {
    const insights: ProductivityInsight[] = [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Peak performance times insight
    if (focusSessions.length > 5) {
      const hourlyScores: { [hour: number]: number[] } = {};
      
      focusSessions.forEach(session => {
        const hour = session.startTime.getHours();
        if (!hourlyScores[hour]) hourlyScores[hour] = [];
        hourlyScores[hour].push(session.focusScore);
      });

      const avgScoresByHour = Object.entries(hourlyScores).map(([hour, scores]) => ({
        hour: parseInt(hour),
        avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }));

      const bestHour = avgScoresByHour.reduce((best, current) => 
        current.avgScore > best.avgScore ? current : best
      );

      insights.push({
        type: InsightType.PEAK_PERFORMANCE_TIMES,
        title: 'Your peak focus time',
        description: `You focus best around ${bestHour.hour}:00 with an average score of ${bestHour.avgScore.toFixed(1)}/10`,
        data: { peakHour: bestHour.hour, avgScore: bestHour.avgScore, hourlyData: avgScoresByHour },
        actionable: true,
        timeframe: { start: weekAgo, end: now }
      });
    }

    // Task completion trends
    const completedThisWeek = tasks.filter(task => 
      task.completedAt && task.completedAt >= weekAgo
    ).length;

    const totalThisWeek = tasks.filter(task => 
      task.createdAt >= weekAgo
    ).length;

    if (totalThisWeek > 0) {
      insights.push({
        type: InsightType.TASK_COMPLETION_TRENDS,
        title: 'Weekly completion rate',
        description: `You completed ${completedThisWeek} out of ${totalThisWeek} tasks this week (${((completedThisWeek / totalThisWeek) * 100).toFixed(0)}%)`,
        data: { completed: completedThisWeek, total: totalThisWeek, rate: (completedThisWeek / totalThisWeek) * 100 },
        actionable: true,
        timeframe: { start: weekAgo, end: now }
      });
    }

    return insights;
  }
} 