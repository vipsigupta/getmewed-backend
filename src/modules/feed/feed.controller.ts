import {
  Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedPostDto, CreateReactionDto, CreateCommentDto } from './dto/feed.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@UseGuards(FirebaseAuthGuard, ThrottlerGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // --- POSTS ---

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 posts per minute
  @Post('create')
  createPost(@Body() dto: CreateFeedPostDto) {
    return this.feedService.createPost(dto);
  }

  @Get(':spaceId')
  getFeed(
    @Param('spaceId') spaceId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getFeed(spaceId, cursor, limit ? +limit : 20);
  }

  @Get(':spaceId/trending')
  getTrending(@Param('spaceId') spaceId: string) {
    return this.feedService.getTrending(spaceId);
  }

  // --- REACTIONS ---

  @Throttle({ default: { limit: 20, ttl: 10000 } }) // 20 reactions per 10 seconds
  @Post('react')
  addReaction(@Body() dto: CreateReactionDto) {
    return this.feedService.addReaction(dto);
  }

  @Delete(':postId/react')
  removeReaction(
    @Param('postId') postId: string,
    @Query('guestId') guestId: string,
    @Query('emoji') emoji: string,
  ) {
    return this.feedService.removeReaction(postId, guestId, emoji);
  }

  // --- COMMENTS ---

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 comments per minute
  @Post('comment')
  addComment(@Body() dto: CreateCommentDto) {
    return this.feedService.addComment(dto);
  }

  @Get(':postId/comments')
  getComments(
    @Param('postId') postId: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getComments(postId, limit ? +limit : 50);
  }
}
