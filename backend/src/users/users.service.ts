import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from '@adhd-dashboard/shared-types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async findByEmail(email: string, organizationId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, organizationId },
      relations: ['organization'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, { isActive: false });
  }
} 