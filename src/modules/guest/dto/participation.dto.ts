import {
  IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID,
} from 'class-validator';
import { GuestGroup, AttendanceStatus } from '@prisma/client';

export class JoinSpaceDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string; // Guest uses short code from the invitation link

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(GuestGroup)
  @IsOptional()
  group?: GuestGroup;

  @IsString()
  @IsOptional()
  relation?: string; // e.g. "MAMAJI", "COUSIN", "FRIEND"

  @IsString()
  @IsOptional()
  profileUrl?: string;
}

export class UpdateParticipationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(GuestGroup)
  @IsOptional()
  group?: GuestGroup;

  @IsString()
  @IsOptional()
  relation?: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  attendance?: AttendanceStatus;

  @IsString()
  @IsOptional()
  profileUrl?: string;
}

export class LeaveSpaceDto {
  @IsUUID()
  @IsNotEmpty()
  spaceId: string;
}
