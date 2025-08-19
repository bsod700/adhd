import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { FocusSession } from '../tasks/entities/focus-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, FocusSession])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {} 