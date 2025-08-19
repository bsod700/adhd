import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class TaskReorderRequestDto {
  @ApiProperty({ description: 'Array of task IDs in current order', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  readonly taskIds!: readonly string[];

  @ApiProperty({ description: 'Current time context' })
  @IsString()
  readonly currentTime!: string;

  @ApiProperty({ description: 'User timezone' })
  @IsString()
  readonly timeZone!: string;
} 