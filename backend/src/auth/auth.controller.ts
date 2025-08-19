import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse
} from '@adhd-dashboard/shared-types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful - returns access token, refresh token and user info'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(loginRequest);
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful - returns access token, refresh token and user info'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists' 
  })
  @Post('register')
  async register(@Body() registerRequest: RegisterRequest): Promise<LoginResponse> {
    return this.authService.register(registerRequest);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully - returns new access token, refresh token and user info'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid refresh token' 
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshToken: { refreshToken: string }): Promise<LoginResponse> {
    return this.authService.refreshToken(refreshToken.refreshToken);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }
} 