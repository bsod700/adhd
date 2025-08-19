

// Dashboard UI Constants
export const DASHBOARD_UI = {
  TITLES: {
    WELCOME: 'Welcome back!',
    QUICK_STATS: 'Quick Stats',
    AI_SUGGESTIONS: 'Recent AI Suggestions',
    RECENT_TASKS: 'Recent Tasks',
    WEEKLY_PROGRESS: 'Weekly Progress',
    COMPLETION_RATE: 'Task Completion Rate',
    BACKEND_INTEGRATION: 'Backend Integration'
  },
  MESSAGES: {
    WELCOME_SUBTITLE: 'You\'re doing great! Here\'s your productivity overview for today.',
    INTEGRATION_DESCRIPTION: '🚀 Full-stack SaaS architecture with NestJS backend, PostgreSQL/SQLite database, JWT authentication, multi-tenant support, and AI-powered task suggestions.',
    NO_TASKS: 'No tasks available',
    NO_SUGGESTIONS: 'No AI suggestions at the moment',
    LOADING: 'Loading...',
    ERROR: 'Something went wrong. Please try again.'
  },
  BUTTONS: {
    CREATE_TASK: 'Create Task',
    GET_AI_SUGGESTIONS: 'Get AI Suggestions',
    VIEW_ALL: 'View All',
    REFRESH: 'Refresh'
  }
} as const;

// Dashboard Layout Constants
export const DASHBOARD_LAYOUT = {
  GRID: {
    SIDEBAR_COLS: 1,
    MAIN_COLS: 3,
    CHARTS_COLS: 2
  },
  BREAKPOINTS: {
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1280px'
  },
  SPACING: {
    SECTION: '1.5rem',
    CARD: '1rem',
    ELEMENT: '0.5rem'
  }
} as const;

// Animation and Timing Constants
export const DASHBOARD_ANIMATIONS = {
  DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  DELAYS: {
    STAGGER: 100,
    HOVER: 50
  },
  EASING: {
    DEFAULT: 'ease-in-out',
    SPRING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// Chart Configuration Constants
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    SECONDARY: '#64748b'
  },
  DIMENSIONS: {
    HEIGHT: 256,
    WIDTH: '100%'
  },
  OPTIONS: {
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false,
    ANIMATION_DURATION: 750
  }
} as const;

// Status Badge Configuration
export const STATUS_CONFIG = {
  STYLES: {
    [TaskStatus.COMPLETED]: {
      indicator: 'bg-green-500',
      badge: 'text-gray-500 bg-green-100',
      text: 'text-green-800'
    },
    [TaskStatus.IN_PROGRESS]: {
      indicator: 'bg-yellow-500',
      badge: 'text-gray-500 bg-yellow-100',
      text: 'text-yellow-800'
    },
    [TaskStatus.TODO]: {
      indicator: 'bg-blue-500',
      badge: 'text-gray-500 bg-blue-100',
      text: 'text-blue-800'
    },
    [TaskStatus.CANCELLED]: {
      indicator: 'bg-gray-500',
      badge: 'text-gray-500 bg-gray-100',
      text: 'text-gray-800'
    }
  },
  LABELS: {
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.CANCELLED]: 'Cancelled'
  }
} as const;

// Import the enums
import { TaskStatus } from '@adhd-dashboard/shared-types'; 