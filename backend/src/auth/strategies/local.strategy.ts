import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: any, email: string, password: string): Promise<User> {
    const organizationSubdomain = req.body?.organizationSubdomain;
    let organizationId: string | undefined;

    // Handle organization context
    if (organizationSubdomain) {
      // This would need to be expanded to look up organization ID from subdomain
      // For now, we'll pass it through
    }

    const user = await this.authService.validateUser(email, password, organizationId);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }
} 