import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { 
  AuthResponse, 
  LoginDto, 
  RegisterDto, 
  UserRole 
} from '@adhd-dashboard/shared-types';

describe('AuthStore', () => {
  let store: typeof AuthStore;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAuthResponse: AuthResponse = {
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      organizationId: 'org1',
      preferences: {},
      isActive: true
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Test Org'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created with initial state', () => {
    expect(store.user()).toBeNull();
    expect(store.accessToken()).toBeNull();
    expect(store.refreshToken()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginPromise = store.login(mockLoginDto);

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginDto);

      req.flush(mockAuthResponse);
      await loginPromise;

      expect(store.user()).toEqual(mockAuthResponse.user);
      expect(store.accessToken()).toBe(mockAuthResponse.accessToken);
      expect(store.refreshToken()).toBe(mockAuthResponse.refreshToken);
      expect(store.isAuthenticated()).toBe(true);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle login validation errors', async () => {
      await store.login({ email: '', password: '' } as LoginDto);
      expect(store.error()).toBe('Email and password are required');
      expect(store.isLoading()).toBe(false);
    });

    it('should handle login HTTP errors', async () => {
      const loginPromise = store.login(mockLoginDto);

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      await loginPromise;

      expect(store.error()).toContain('Invalid credentials');
      expect(store.isAuthenticated()).toBe(false);
      expect(store.isLoading()).toBe(false);
    });

    it('should handle invalid login response', async () => {
      const loginPromise = store.login(mockLoginDto);

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ user: mockAuthResponse.user }); // Missing tokens

      await loginPromise;

      expect(store.error()).toBe('Invalid authentication response');
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registerPromise = store.register(mockRegisterDto);

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterDto);

      req.flush(mockAuthResponse);
      await registerPromise;

      expect(store.user()).toEqual(mockAuthResponse.user);
      expect(store.isAuthenticated()).toBe(true);
      expect(store.error()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle registration validation errors', async () => {
      await store.register({ email: '', password: '', firstName: '', lastName: '' } as RegisterDto);
      expect(store.error()).toBe('All required fields must be provided');
    });

    it('should handle registration HTTP errors', async () => {
      const registerPromise = store.register(mockRegisterDto);

      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });

      await registerPromise;

      expect(store.error()).toContain('Email already exists');
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const refreshPromise = store.refreshToken();

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'valid-refresh-token' });

      req.flush(mockAuthResponse);
      const result = await refreshPromise;

      expect(result).toBe(true);
      expect(store.user()).toEqual(mockAuthResponse.user);
      expect(store.isAuthenticated()).toBe(true);
    });

    it('should return false when no refresh token exists', async () => {
      const result = await store.refreshToken();
      expect(result).toBe(false);
    });

    it('should handle refresh token errors', async () => {
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      spyOn(store, 'logout');

      const refreshPromise = store.refreshToken();

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

      const result = await refreshPromise;

      expect(result).toBe(false);
      expect(store.logout).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      // Set up authenticated state
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');

      store.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(store.user()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('utility methods', () => {
    it('should check admin role correctly', () => {
      // Set user as regular user
      store.user.set({ ...mockAuthResponse.user, role: UserRole.USER } as any);
      expect(store.isAdmin()).toBe(false);

      // Set user as admin
      store.user.set({ ...mockAuthResponse.user, role: UserRole.ADMIN } as any);
      expect(store.isAdmin()).toBe(true);

      // Set user as super admin
      store.user.set({ ...mockAuthResponse.user, role: UserRole.SUPER_ADMIN } as any);
      expect(store.isAdmin()).toBe(true);
    });

    it('should get auth headers correctly', () => {
      // No token
      expect(store.getAuthHeaders()).toEqual({});

      // With token
      store.accessToken.set('test-token');
      expect(store.getAuthHeaders()).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('should clear error', () => {
      store.error.set('Test error');
      store.clearError();
      expect(store.error()).toBeNull();
    });

    it('should store tokens securely', () => {
      store.storeTokens('access-token', 'refresh-token');
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('should throw error for invalid tokens', () => {
      expect(() => store.storeTokens('', 'refresh-token')).toThrow('Invalid tokens provided for storage');
      expect(() => store.storeTokens('access-token', '')).toThrow('Invalid tokens provided for storage');
    });

    it('should extract error messages correctly', () => {
      const httpError = new Error('HTTP Error');
      (httpError as any).error = { message: 'Server error' };
      
      expect(store.extractErrorMessage(httpError, 'Fallback')).toBe('HTTP Error');
      expect(store.extractErrorMessage('String error', 'Fallback')).toBe('String error');
      expect(store.extractErrorMessage({}, 'Fallback')).toBe('Fallback');
    });
  });

  describe('initialization', () => {
    it('should initialize auth from stored tokens', () => {
      localStorage.setItem('accessToken', 'stored-access');
      localStorage.setItem('refreshToken', 'stored-refresh');
      
      spyOn(store, 'refreshToken').and.returnValue(Promise.resolve(true));

      store.initializeAuth();

      expect(store.refreshToken).toHaveBeenCalled();
    });

    it('should not initialize auth without stored tokens', () => {
      spyOn(store, 'refreshToken');

      store.initializeAuth();

      expect(store.refreshToken).not.toHaveBeenCalled();
    });
  });
}); 