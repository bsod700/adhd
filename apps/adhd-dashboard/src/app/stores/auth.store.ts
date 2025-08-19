import {
  signalStore,
  withState,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  AuthUser,
  UserRole,
} from '@adhd-dashboard/shared-types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Authentication store managing user session state and authentication operations.
 *
 * Provides comprehensive authentication functionality including:
 * - User login and registration
 * - Token management and refresh
 * - Session persistence and cleanup
 * - Role-based access control
 *
 * @example
 * ```typescript
 * const authStore = inject(AuthStore);
 * await authStore.login({ email: 'user@example.com', password: 'password' });
 * ```
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, httpClient = inject(HttpClient), router = inject(Router)) => ({
      /**
       * Authenticates user with email and password credentials.
       * Automatically stores tokens and navigates to dashboard on success.
       *
       * @param credentials - User login credentials
       * @throws {Error} When authentication fails or invalid response received
       */
      async login(credentials: LoginRequest): Promise<void> {
        // Validate input
        if (!credentials.email || !credentials.password) {
          patchState(store, {
            error: 'Email and password are required',
          });
          return;
        }

        patchState(store, { isLoading: true, error: null });

        try {
          const response = await httpClient
            .post<LoginResponse>('/api/auth/login', credentials)
            .toPromise();

          if (!response?.accessToken || !response?.refreshToken) {
            throw new Error('Invalid authentication response');
          }

          // Securely store tokens
          this.storeTokens(response.accessToken, response.refreshToken);

          patchState(store, {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Navigate to dashboard
          router.navigate(['/dashboard']);
        } catch (error: unknown) {
          const errorMessage = this.extractErrorMessage(error, 'Login failed');
          patchState(store, {
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      /**
       * Registers a new user account with provided user data.
       * Automatically logs in the user and navigates to dashboard on success.
       *
       * @param userData - User registration data
       * @throws {Error} When registration fails or invalid response received
       */
      async register(userData: RegisterRequest): Promise<void> {
        // Validate input
        if (
          !userData.email ||
          !userData.password ||
          !userData.firstName ||
          !userData.lastName
        ) {
          patchState(store, {
            error: 'All required fields must be provided',
          });
          return;
        }

        patchState(store, { isLoading: true, error: null });

        try {
          const response = await httpClient
            .post<LoginResponse>('/api/auth/register', userData)
            .toPromise();

          if (!response?.accessToken || !response?.refreshToken) {
            throw new Error('Invalid registration response');
          }

          // Securely store tokens
          this.storeTokens(response.accessToken, response.refreshToken);

          patchState(store, {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Navigate to dashboard
          router.navigate(['/dashboard']);
        } catch (error: unknown) {
          const errorMessage = this.extractErrorMessage(
            error,
            'Registration failed'
          );
          patchState(store, {
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      /**
       * Refreshes the current authentication token using the stored refresh token.
       *
       * @returns Promise<boolean> - True if refresh was successful, false otherwise
       */
      async refreshToken(): Promise<boolean> {
        // Check if we're in browser environment
        if (
          typeof window === 'undefined' ||
          typeof localStorage === 'undefined'
        ) {
          return false;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
          const response = await httpClient
            .post<LoginResponse>('/api/auth/refresh', {
              refreshToken,
            })
            .toPromise();

          if (!response?.accessToken || !response?.refreshToken) {
            throw new Error('Invalid refresh response');
          }

          this.storeTokens(response.accessToken, response.refreshToken);

          patchState(store, {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });

          return true;
        } catch (error: unknown) {
          console.error('Token refresh failed:', error);
          this.logout();
          return false;
        }
      },

      /**
       * Logs out the current user by clearing all authentication data.
       * Navigates to login page after cleanup.
       */
      logout(): void {
        // Clear localStorage if available
        if (
          typeof window !== 'undefined' &&
          typeof localStorage !== 'undefined'
        ) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        // Reset store state
        patchState(store, initialState);

        // Navigate to login
        router.navigate(['/auth/login']);
      },

      /**
       * Initializes authentication state from stored tokens.
       * Should be called on app startup to restore user session.
       */
      initializeAuth(): void {
        // Check if we're in browser environment
        if (
          typeof window === 'undefined' ||
          typeof localStorage === 'undefined'
        ) {
          return;
        }

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          // Try to refresh token to validate session
          this.refreshToken();
        }
      },

      /**
       * Clears the current error state.
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Checks if the current user has admin privileges.
       *
       * @returns boolean - True if user is admin or super admin
       */
      isAdmin(): boolean {
        const user = store.user();
        return (
          user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
        );
      },

      /**
       * Gets HTTP headers with authentication token for API requests.
       *
       * @returns Object containing Authorization header or empty object
       */
      getAuthHeaders(): Record<string, string> {
        const token = store.accessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      /**
       * Securely stores authentication tokens in localStorage.
       * Validates tokens before storage.
       *
       * @private
       * @param accessToken - JWT access token
       * @param refreshToken - JWT refresh token
       */
      storeTokens(accessToken: string, refreshToken: string): void {
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid tokens provided for storage');
        }

        // Only store if localStorage is available
        if (
          typeof window !== 'undefined' &&
          typeof localStorage !== 'undefined'
        ) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },

      /**
       * Extracts meaningful error message from various error types.
       *
       * @private
       * @param error - Error object from HTTP request or other source
       * @param fallback - Default message if extraction fails
       * @returns Formatted error message
       */
      extractErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
          return error.error?.message || error.message || fallback;
        }
        if (error instanceof Error) {
          return error.message;
        }
        if (typeof error === 'string') {
          return error;
        }
        return fallback;
      },
    })
  ),
  withHooks({
    /**
     * Initializes authentication state when the store is created.
     * Attempts to restore user session from stored tokens.
     */
    onInit(store) {
      store.initializeAuth();
    },
  })
);
