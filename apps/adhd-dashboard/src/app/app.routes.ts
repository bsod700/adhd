import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - ADHD Productivity'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
    title: 'Tasks - ADHD Productivity'
  },
  {
    path: 'ai-assistant',
    loadComponent: () => import('./pages/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent),
    title: 'AI Assistant - ADHD Productivity'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login - ADHD Productivity'
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Register - ADHD Productivity'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
