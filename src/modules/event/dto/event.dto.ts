import {
  IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsUUID,
} from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;
}

export class UpdateEventStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;
}

export class MarkArrivalDto {
  @IsUUID()
  @IsNotEmpty()
  guestId: string;
}
