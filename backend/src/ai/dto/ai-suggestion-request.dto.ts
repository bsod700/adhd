import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsString,
  ValidateNested,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { SuggestionType } from '@adhd-dashboard/shared-types';

export class AiPreferencesDto {
  @ApiProperty({ description: 'Types of suggestions to generate', enum: SuggestionType, isArray: true })
  @IsArray()
  @IsEnum(SuggestionType, { each: true })
  readonly suggestionTypes!: SuggestionType[];

  @ApiProperty({ description: 'Maximum number of suggestions', minimum: 1, maximum: 10, default: 5 })
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly maxSuggestions: number = 5;

  @ApiProperty({ description: 'AI personality type', enum: ['supportive', 'motivational', 'analytical', 'casual'], required: false })
  @IsOptional()
  @IsEnum(['supportive', 'motivational', 'analytical', 'casual'])
  readonly personalityType?: 'supportive' | 'motivational' | 'analytical' | 'casual' = 'supportive';

  @ApiProperty({ description: 'Include explanations in suggestions', default: true })
  @IsOptional()
  readonly includeExplanations?: boolean = true;
}

export class AiSuggestionRequestDto {
  @ApiProperty({ description: 'Current time context' })
  @IsString()
  readonly currentTime!: string;

  @ApiProperty({ description: 'User timezone' })
  @IsString()
  readonly timeZone!: string;

  @ApiProperty({ description: 'AI preferences', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AiPreferencesDto)
  readonly preferences?: AiPreferencesDto;
} 