import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { FeedPostType } from '@prisma/client';

export class CreateFeedPostDto {
  @IsEnum(FeedPostType)
  type: FeedPostType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;

  // Array of mediaIds already uploaded to Supabase via /media/upload-url
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  mediaIds?: string[];
}

export class CreateReactionDto {
  @IsUUID()
  @IsNotEmpty()
  feedPostId: string;

  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsString()
  @IsNotEmpty()
  emoji: string; // e.g. "❤️", "🔥", "🎉"
}

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  feedPostId: string;

  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class GetFeedDto {
  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsString()
  @IsOptional()
  cursor?: string; // cursor-based pagination (last post createdAt ISO string)

  @IsOptional()
  limit?: number;
}
