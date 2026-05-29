import {
  IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsArray,
} from 'class-validator';
import { SpaceStatus, SpaceEventType } from '@prisma/client';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsDateString()
  date: string;

  @IsEnum(SpaceEventType)
  @IsOptional()
  eventType?: SpaceEventType;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  locationLink?: string;

  @IsString()
  @IsOptional()
  keyPeople?: string; // Serialized JSON containing VIP details

  @IsArray()
  @IsOptional()
  timeline?: {
    title: string;
    time: string;
    venue: string;
    period: 'MORNING' | 'AFTERNOON' | 'EVENING';
    dressCode?: string;
    mealOptions?: string;
  }[];
}

export class UpdateSpaceStatusDto {
  @IsEnum(SpaceStatus)
  status: SpaceStatus;
}
