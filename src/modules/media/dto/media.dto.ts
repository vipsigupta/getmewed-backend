import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { MediaType } from '@prisma/client';

export class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsUUID()
  @IsNotEmpty()
  guestId: string;
}
