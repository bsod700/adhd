import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Core imports
import { 
  DashboardStats, 
  RecentTask, 
  AiSuggestion
} from '../../core/interfaces/dashboard.interface';
import { TaskStatus } from '@adhd-dashboard/shared-types';
import { 
  MOCK_DASHBOARD_STATS, 
  MOCK_RECENT_TASKS, 
  MOCK_AI_SUGGESTIONS,
  MOCK_API_DELAYS 
} from '../../core/mocks/dashboard.mock';
import { 
  DASHBOARD_UI, 
  STATUS_CONFIG 
} from '../../core/constants/dashboard.constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  
  // Reactive state using signals
  readonly stats = signal<DashboardStats | null>(null);
  readonly recentTasks = signal<RecentTask[]>([]);
  readonly aiSuggestions = signal<AiSuggestion[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Constants for template
  readonly UI = DASHBOARD_UI;
  readonly STATUS_CONFIG = STATUS_CONFIG;
  readonly TaskStatus = TaskStatus;

  ngOnInit(): void {
    // Only load data in browser environment to avoid SSR/prerendering issues
    if (typeof window !== 'undefined') {
      void this.loadDashboardData();
    }
  }

  /**
   * Simulates loading dashboard data with realistic delays
   */
  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Simulate API calls with delays for realistic UX
      const [stats, tasks, suggestions] = await Promise.all([
        this.simulateApiCall(MOCK_DASHBOARD_STATS, MOCK_API_DELAYS.DASHBOARD_STATS),
        this.simulateApiCall(MOCK_RECENT_TASKS, MOCK_API_DELAYS.RECENT_TASKS),
        this.simulateApiCall(MOCK_AI_SUGGESTIONS, MOCK_API_DELAYS.AI_SUGGESTIONS)
      ]);

      // Update state
      this.stats.set(stats);
      this.recentTasks.set(tasks);
      this.aiSuggestions.set(suggestions);

    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Simulates an API call with delay
   */
  private simulateApiCall<T>(data: T, delay: number): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  /**
   * Handles task creation
   */
  onCreateTask(): void {
    // TODO: Implement task creation modal/navigation
    console.warn('Creating new task...');
    // In a real app, this would:
    // 1. Open task creation modal
    // 2. Navigate to task creation page
    // 3. Use a service to create the task
  }

  /**
   * Handles AI suggestions request
   */
  onGetAiSuggestions(): void {
    // TODO: Implement AI suggestions service call
    console.warn('Requesting AI suggestions...');
    // In a real app, this would:
    // 1. Call AI service
    // 2. Update suggestions list
    // 3. Show loading state during request
  }

  /**
   * Navigates to tasks page
   */
  onViewAllTasks(): void {
    // TODO: Implement navigation to tasks page
    console.warn('Navigating to tasks page...');
    // In a real app, this would use Router.navigate()
  }

  /**
   * Refreshes dashboard data
   */
  onRefresh(): void {
    void this.loadDashboardData();
  }

  /**
   * Gets status badge classes for a task
   */
  getTaskStatusClasses(status: TaskStatus): string {
    const config = this.STATUS_CONFIG.STYLES[status as keyof typeof this.STATUS_CONFIG.STYLES];
    return config?.badge || '';
  }

  /**
   * Gets status indicator classes for a task
   */
  getStatusIndicatorClasses(status: TaskStatus): string {
    const config = this.STATUS_CONFIG.STYLES[status as keyof typeof this.STATUS_CONFIG.STYLES];
    return config?.indicator || '';
  }

  /**
   * Gets status label for a task
   */
  getStatusLabel(status: TaskStatus): string {
    const label = this.STATUS_CONFIG.LABELS[status as keyof typeof this.STATUS_CONFIG.LABELS];
    return label || status;
  }

  /**
   * Gets suggestion type-specific CSS class
   */
  getSuggestionTypeClass(type: string): string {
    return `suggestion-${type.replace('_', '-')}`;
  }

  /**
   * Track by functions for ngFor performance optimization
   */
  trackByTaskId = (_: number, task: RecentTask): string => task.id;

  trackBySuggestionId = (_: number, suggestion: AiSuggestion): string => suggestion.id;
} 