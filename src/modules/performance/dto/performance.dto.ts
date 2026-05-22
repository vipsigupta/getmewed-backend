import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { PerformanceStatus } from '@prisma/client';

export class CreatePerformanceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  performers: string;

  @IsString()
  @IsOptional()
  songName?: string;

  @IsInt()
  @Min(0)
  sequence: number;

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;
}

export class UpdatePerformanceStatusDto {
  @IsEnum(PerformanceStatus)
  status: PerformanceStatus;
}

export class ReorderPerformanceDto {
  @IsUUID()
  @IsNotEmpty()
  performanceId: string;

  @IsInt()
  @Min(0)
  newSequence: number;
}
