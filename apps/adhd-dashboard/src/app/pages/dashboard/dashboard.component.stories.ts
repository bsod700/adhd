import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import {
  DashboardStats,
  RecentTask,
  AiSuggestion,
  TaskStatus,
  TaskPriority,
  SuggestionType,
} from '../../core/interfaces/dashboard.interface';

const decorators = [
  moduleMetadata({
    imports: [CommonModule],
  }),
  (story: any) => ({
    component: story.component,
    props: story.props,
  }),
];

// Mock data with updated structure
const mockStats: DashboardStats = {
  todayTasks: 8,
  completed: 5,
  overdue: 2,
  focusScore: 85,
  totalTasks: 15,
  completionRate: 0.67,
};

const mockRecentTasks: RecentTask[] = [
  {
    id: '1',
    title: 'Review project proposal',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date('2024-03-25'),
  },
  {
    id: '2',
    title: 'Update documentation',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2024-03-26'),
  },
  {
    id: '3',
    title: 'Fix authentication bug',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: new Date('2024-03-24'),
  },
];

const mockAiSuggestions: AiSuggestion[] = [
  {
    id: '1',
    type: SuggestionType.BREAK,
    message: 'Take a 15-minute break to maintain focus',
    priority: 'high',
    actionable: true,
  },
  {
    id: '2',
    type: SuggestionType.PRIORITIZATION,
    message: 'Focus on high-priority tasks during your peak energy hours',
    priority: 'medium',
    actionable: true,
  },
  {
    id: '3',
    type: SuggestionType.TASK_BREAKDOWN,
    message: 'Break down "Review project proposal" into smaller tasks',
    priority: 'low',
    actionable: true,
  },
];

const meta: Meta<DashboardComponent> = {
  title: 'Pages/Dashboard',
  component: DashboardComponent,
  decorators,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main dashboard component showing stats, recent tasks, and AI suggestions',
      },
    },
  },
  argTypes: {
    // No direct inputs for this component as it manages its own state
  },
};

export default meta;
type Story = StoryObj<DashboardComponent>;

// Helper function to create component with mocked signals
const createDashboardStory = (
  stats: DashboardStats,
  tasks: RecentTask[],
  suggestions: AiSuggestion[],
  isLoading = false,
  error: string | null = null
) => ({
  render: (args: any) => ({
    props: {
      ...args,
      // Mock the signal properties
      dashboardStats: signal(stats),
      recentTasks: signal(tasks),
      aiSuggestions: signal(suggestions),
      isLoading: signal(isLoading),
      error: signal(error),
    },
  }),
});

export const Default: Story = {
  ...createDashboardStory(mockStats, mockRecentTasks, mockAiSuggestions),
  parameters: {
    docs: {
      description: {
        story: 'Default dashboard view with sample data',
      },
    },
  },
};

export const Loading: Story = {
  ...createDashboardStory(mockStats, [], [], true),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in loading state',
      },
    },
  },
};

export const Empty: Story = {
  ...createDashboardStory(
    { ...mockStats, todayTasks: 0, completed: 0, overdue: 0 },
    [],
    []
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with no tasks or suggestions',
      },
    },
  },
};

export const HighActivity: Story = {
  ...createDashboardStory(
    { ...mockStats, todayTasks: 15, completed: 12, overdue: 1, focusScore: 95 },
    mockRecentTasks,
    mockAiSuggestions
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing high activity and productivity',
      },
    },
  },
};

export const WithOverdueTasks: Story = {
  ...createDashboardStory(
    { ...mockStats, overdue: 5, focusScore: 65 },
    mockRecentTasks.map(task => ({ ...task, status: TaskStatus.BLOCKED })),
    [
      {
        id: '1',
        type: SuggestionType.PRIORITIZATION,
        message: 'You have overdue tasks that need immediate attention',
        priority: 'high',
        actionable: true,
      },
      ...mockAiSuggestions.slice(1),
    ]
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard highlighting overdue tasks',
      },
    },
  },
};

export const ErrorState: Story = {
  ...createDashboardStory(mockStats, [], [], false, 'Failed to load dashboard data'),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing error state',
      },
    },
  },
};

// Interactive stories for different viewport sizes
export const Mobile: Story = {
  ...createDashboardStory(mockStats, mockRecentTasks, mockAiSuggestions),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Dashboard optimized for mobile view',
      },
    },
  },
};

export const Tablet: Story = {
  ...createDashboardStory(mockStats, mockRecentTasks, mockAiSuggestions),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Dashboard optimized for tablet view',
      },
    },
  },
};

// Dark mode stories
const darkModeDecorator = (story: any) => ({
  ...story,
  template: `<div class="dark">${story.template}</div>`,
});

export const DarkMode: Story = {
  ...createDashboardStory(mockStats, mockRecentTasks, mockAiSuggestions),
  decorators: [darkModeDecorator],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dashboard in dark mode',
      },
    },
  },
};

export const DarkModeWithOverdue: Story = {
  ...createDashboardStory(
    { ...mockStats, overdue: 3 },
    mockRecentTasks,
    mockAiSuggestions
  ),
  decorators: [darkModeDecorator],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark mode dashboard with overdue tasks',
      },
    },
  },
};