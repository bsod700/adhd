import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { 
  DashboardStats, 
  RecentTask, 
  AiSuggestion, 
  TaskStatus,
  AiSuggestionType
} from '../../core/interfaces/dashboard.interface';
import { DASHBOARD_UI } from '../../core/constants/dashboard.constants';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockStats: DashboardStats = {
    todayTasks: 5,
    completed: 3,
    overdue: 1,
    focusScore: 85
  };

  const mockTasks: RecentTask[] = [
    {
      id: '1',
      title: 'Test Task 1',
      status: TaskStatus.COMPLETED,
      priority: 'high' as any
    },
    {
      id: '2', 
      title: 'Test Task 2',
      status: TaskStatus.IN_PROGRESS,
      priority: 'medium' as any
    }
  ];

  const mockSuggestions: AiSuggestion[] = [
    {
      id: '1',
      message: 'Take a break',
      type: AiSuggestionType.BREAK
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, CommonModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading()).toBe(true);
    expect(component.stats()).toBeNull();
    expect(component.recentTasks()).toEqual([]);
    expect(component.aiSuggestions()).toEqual([]);
  });

  it('should load dashboard data on init', async () => {
    spyOn(component, 'loadDashboardData' as any);
    component.ngOnInit();
    expect(component['loadDashboardData']).toHaveBeenCalled();
  });

  it('should handle task creation', () => {
    spyOn(console, 'log');
    component.onCreateTask();
    expect(console.log).toHaveBeenCalledWith('Creating new task...');
  });

  it('should handle AI suggestions request', () => {
    spyOn(console, 'log');
    component.onGetAiSuggestions();
    expect(console.log).toHaveBeenCalledWith('Requesting AI suggestions...');
  });

  it('should handle view all tasks', () => {
    spyOn(console, 'log');
    component.onViewAllTasks();
    expect(console.log).toHaveBeenCalledWith('Navigating to tasks page...');
  });

  it('should get task status classes correctly', () => {
    const classes = component.getTaskStatusClasses(TaskStatus.COMPLETED);
    expect(classes).toContain('bg-green-100');
  });

  it('should get status indicator classes correctly', () => {
    const classes = component.getStatusIndicatorClasses(TaskStatus.IN_PROGRESS);
    expect(classes).toContain('bg-yellow-500');
  });

  it('should get status label correctly', () => {
    const label = component.getStatusLabel(TaskStatus.TODO);
    expect(label).toBe('To Do');
  });

  it('should get suggestion type class correctly', () => {
    const className = component.getSuggestionTypeClass('task_breakdown');
    expect(className).toBe('suggestion-task-breakdown');
  });

  it('should provide trackBy functions', () => {
    const task = mockTasks[0];
    const suggestion = mockSuggestions[0];
    
    expect(component.trackByTaskId(0, task)).toBe(task.id);
    expect(component.trackBySuggestionId(0, suggestion)).toBe(suggestion.id);
  });

  it('should expose UI constants', () => {
    expect(component.UI).toBe(DASHBOARD_UI);
    expect(component.TaskStatus).toBe(TaskStatus);
  });

  it('should simulate data loading with proper state transitions', async () => {
    // Test loading state management
    expect(component.isLoading()).toBe(true);
    
    // Wait for component initialization
    fixture.detectChanges();
    await fixture.whenStable();
    
    // After loading completes, should have data
    expect(component.isLoading()).toBe(false);
    expect(component.stats()).toBeTruthy();
  });

  it('should handle refresh correctly', () => {
    spyOn(component, 'loadDashboardData' as any);
    component.onRefresh();
    expect(component['loadDashboardData']).toHaveBeenCalled();
  });

  it('should render loading state in template', () => {
    component.isLoading.set(true);
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingElement).toBeTruthy();
  });

  it('should render error state in template', () => {
    component.isLoading.set(false);
    component.error.set('Test error message');
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-container');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Test error message');
  });

  it('should render dashboard content when loaded', () => {
    component.isLoading.set(false);
    component.error.set(null);
    component.stats.set(mockStats);
    fixture.detectChanges();
    
    const dashboardElement = fixture.nativeElement.querySelector('.grid');
    expect(dashboardElement).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    component.isLoading.set(false);
    component.stats.set(mockStats);
    fixture.detectChanges();
    
    const buttons = fixture.nativeElement.querySelectorAll('button[aria-label]');
    expect(buttons.length).toBeGreaterThan(0);
  });
}); 