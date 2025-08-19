export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly organizationSubdomain?: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
  readonly expiresIn: number;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly organizationId?: string;
  readonly permissions: readonly string[];
}

export interface RefreshTokenRequest {
  readonly refreshToken: string;
}

export interface RefreshTokenResponse {
  readonly accessToken: string;
  readonly expiresIn: number;
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly organizationId?: string;
  readonly organizationName?: string;
  readonly organizationSubdomain?: string;
}

export interface ForgotPasswordRequest {
  readonly email: string;
}

export interface ResetPasswordRequest {
  readonly token: string;
  readonly newPassword: string;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly user: AuthUser | null;
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// JWT token structure
export interface JwtPayload {
  readonly sub: string; // user ID
  readonly email: string;
  readonly role: UserRole;
  readonly organizationId: string | undefined;
  readonly iat: number;
  readonly exp: number;
}

// Permission-based access control
export enum Permission {
  // Task permissions
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  
  // User permissions
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Admin permissions
  ADMIN_READ = 'admin:read',
  ADMIN_WRITE = 'admin:write',
  
  // Organization permissions
  ORG_READ = 'org:read',
  ORG_WRITE = 'org:write',
  ORG_ADMIN = 'org:admin',
  
  // AI permissions
  AI_SUGGESTIONS = 'ai:suggestions',
  AI_ANALYTICS = 'ai:analytics'
}

export interface RolePermissions {
  readonly [UserRole.USER]: readonly Permission[];
  readonly [UserRole.ADMIN]: readonly Permission[];
  readonly [UserRole.SUPER_ADMIN]: readonly Permission[];
} 