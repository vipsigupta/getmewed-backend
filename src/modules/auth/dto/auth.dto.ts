import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { GuestGroup } from '@prisma/client';

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class JoinSpaceDto {
  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(GuestGroup)
  @IsOptional()
  group?: GuestGroup;

  @IsString()
  @IsOptional()
  relation?: string;
}
