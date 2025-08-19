export interface AiSuggestionRequest {
  readonly userId: string;
  readonly context: AiContext;
  readonly preferences?: AiPreferences;
}

export interface AiContext {
  readonly currentTasks: readonly import('./task.types').Task[];
  readonly recentActivity: readonly ActivityRecord[];
  readonly userProfile: import('./user.types').AdhdProfile;
  readonly currentTime: Date;
  readonly timeZone: string;
}

export interface ActivityRecord {
  readonly type: ActivityType;
  readonly timestamp: Date;
  readonly taskId?: string;
  readonly duration?: number; // in minutes
  readonly focusScore?: number;
  readonly notes?: string;
}

export enum ActivityType {
  TASK_CREATED = 'task_created',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_PAUSED = 'task_paused',
  BREAK_TAKEN = 'break_taken',
  DISTRACTION_NOTED = 'distraction_noted',
  MOOD_LOGGED = 'mood_logged'
}

export interface AiPreferences {
  readonly suggestionTypes: readonly SuggestionType[];
  readonly maxSuggestions: number;
  readonly personalityType?: 'supportive' | 'motivational' | 'analytical' | 'casual';
  readonly includeExplanations: boolean;
}

export enum SuggestionType {
  TASK_PRIORITIZATION = 'task_prioritization',
  OPTIMAL_TIMING = 'optimal_timing',
  TASK_BREAKDOWN = 'task_breakdown',
  FOCUS_STRATEGIES = 'focus_strategies',
  ENERGY_MANAGEMENT = 'energy_management',
  MOTIVATION_BOOST = 'motivation_boost'
}

export interface AiSuggestionResponse {
  readonly suggestions: readonly AiSuggestion[];
  readonly confidence: number; // 0-1
  readonly reasoning?: string;
  readonly generatedAt: Date;
}

export interface AiSuggestion {
  readonly id: string;
  readonly type: SuggestionType;
  readonly title: string;
  readonly description: string;
  readonly actionable: boolean;
  readonly priority: 'low' | 'medium' | 'high';
  readonly estimatedImpact: number; // 1-10
  readonly timeToImplement: number; // in minutes
  readonly relatedTaskIds: readonly string[];
  readonly metadata?: AiSuggestionMetadata;
}

export interface AiSuggestionMetadata {
  readonly suggestedTime?: Date;
  readonly energyLevelRequired?: import('./task.types').TaskEnergyLevel;
  readonly contextualFactors?: readonly string[];
  readonly alternatives?: readonly string[];
}

// Task reordering suggestions
export interface TaskReorderSuggestion {
  readonly originalOrder: readonly string[]; // task IDs
  readonly suggestedOrder: readonly string[]; // task IDs
  readonly reasoning: readonly ReorderReason[];
  readonly estimatedProductivityGain: number; // percentage
}

export interface ReorderReason {
  readonly taskId: string;
  readonly reason: string;
  readonly factorsConsidered: readonly string[];
}

// Focus and productivity insights
export interface ProductivityInsight {
  readonly type: InsightType;
  readonly title: string;
  readonly description: string;
  readonly data: unknown; // Flexible data structure for different insight types
  readonly actionable: boolean;
  readonly timeframe: {
    readonly start: Date;
    readonly end: Date;
  };
}

export enum InsightType {
  PEAK_PERFORMANCE_TIMES = 'peak_performance_times',
  DISTRACTION_PATTERNS = 'distraction_patterns',
  TASK_COMPLETION_TRENDS = 'task_completion_trends',
  ENERGY_OPTIMIZATION = 'energy_optimization',
  CONTEXT_SWITCHING_IMPACT = 'context_switching_impact',
  BREAK_EFFECTIVENESS = 'break_effectiveness'
}

// AI model configuration
export interface AiModelConfig {
  readonly provider: AiProvider;
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly systemPrompt: string;
}

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  LOCAL = 'local'
}

export interface AiUsageStats {
  readonly totalRequests: number;
  readonly totalTokensUsed: number;
  readonly avgResponseTime: number; // in ms
  readonly successRate: number; // 0-1
  readonly lastUsed: Date;
} 