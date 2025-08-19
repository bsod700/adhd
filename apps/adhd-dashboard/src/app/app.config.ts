import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { 
  provideTanStackQuery, 
  QueryClient 
} from '@tanstack/angular-query-experimental';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zoneless change detection for better performance
    provideZonelessChangeDetection(),
    
    // Router
    provideRouter(appRoutes),
    
    // HTTP Client with interceptors
    provideHttpClient(withInterceptorsFromDi()),
    
    // Animations for UI components
    provideAnimations(),
    
    // TanStack Query for state management and caching
    provideTanStackQuery(new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 2,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 1,
        },
      },
    })),
  ],
};
