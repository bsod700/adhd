import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  JwtPayload,
  UserRole 
} from '@adhd-dashboard/shared-types';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string, organizationId?: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { 
        email, 
        ...(organizationId && { organizationId }),
        isActive: true 
      },
      relations: ['organization'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    let organizationId: string | undefined;

    // If subdomain is provided, find the organization
    if (loginRequest.organizationSubdomain) {
      const organization = await this.organizationRepository.findOne({
        where: { subdomain: loginRequest.organizationSubdomain, isActive: true },
      });

      if (!organization) {
        throw new UnauthorizedException('Organization not found');
      }

      organizationId = organization.id;
    }

    const user = await this.validateUser(loginDto.email, loginDto.password, organizationId);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return this.generateTokens(user);
  }

  async register(registerRequest: RegisterRequest): Promise<LoginResponse> {
    const { email, password, confirmPassword, firstName, lastName, organizationName, organizationSubdomain } = registerRequest;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let organization: Organization;

    if (organizationName) {
      // Create new organization
      const subdomain = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      const existingOrg = await this.organizationRepository.findOne({
        where: { subdomain },
      });

      if (existingOrg) {
        throw new ConflictException('Organization subdomain already exists');
      }

      organization = this.organizationRepository.create({
        name: organizationName,
        subdomain,
        settings: {
          allowUserRegistration: true,
          defaultUserRole: 'user',
          taskRetentionDays: 365,
          aiIntegrationEnabled: true,
          customBranding: {
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af',
          },
        },
      });

      await this.organizationRepository.save(organization);
    } else if (organizationSubdomain) {
      // Join existing organization
      organization = await this.organizationRepository.findOne({
        where: { subdomain: organizationSubdomain, isActive: true },
      });

      if (!organization) {
        throw new BadRequestException('Organization not found');
      }

      if (!organization.settings.allowUserRegistration) {
        throw new BadRequestException('User registration is not allowed for this organization');
      }
    } else {
      throw new BadRequestException('Organization information is required');
    }

    // Check if user already exists in this organization
    const existingUser = await this.userRepository.findOne({
      where: { email, organizationId: organization.id },
    });

    if (existingUser) {
      throw new ConflictException('User already exists in this organization');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId: organization.id,
      role: organizationName ? UserRole.ADMIN : organization.settings.defaultUserRole as UserRole,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
        relations: ['organization'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User): LoginResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }
} 