import {
  IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString,
} from 'class-validator';
import { SpaceStatus } from '@prisma/client';

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
}

export class UpdateSpaceStatusDto {
  @IsEnum(SpaceStatus)
  status: SpaceStatus;
}
