import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { CreateFeedPostDto, CreateReactionDto, CreateCommentDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: EventsGateway,
  ) {}

  // -----------------------------------------------------------------
  // FEED
  // -----------------------------------------------------------------

  async createPost(dto: CreateFeedPostDto) {
    const { spaceId, guestId, type, content, eventId, mediaIds } = dto;

    // Validate guest belongs to space
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest || guest.spaceId !== spaceId) {
      throw new NotFoundException('Guest not found in this space');
    }

    // Create the post with media join records
    const post = await this.prisma.feedPost.create({
      data: {
        type,
        content,
        spaceId,
        guestId,
        eventId: eventId || null,
        mediaItems: mediaIds?.length
          ? {
              create: mediaIds.map((mediaId, index) => ({
                mediaId,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        guest: { select: { id: true, name: true, profileUrl: true, group: true } },
        mediaItems: {
          include: { media: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    // Realtime: broadcast to all guests in the space
    this.gateway.broadcastToSpace(spaceId, 'server:feed_updated', post);
    // Big screen sync
    this.gateway.broadcastToBigScreen(spaceId, 'bigscreen:live_feed', post);

    return post;
  }

  async getFeed(spaceId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.feedPost.findMany({
      where: {
        spaceId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        guest: { select: { id: true, name: true, profileUrl: true, group: true } },
        mediaItems: {
          include: { media: { select: { id: true, url: true, type: true } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    const nextCursor = posts.length === limit
      ? posts[posts.length - 1].createdAt.toISOString()
      : null;

    let feedContext = undefined;
    
    // Only return context on the first page load
    if (!cursor) {
      const space = await this.prisma.space.findUnique({
        where: { id: spaceId },
        select: { name: true, date: true, status: true },
      });

      const guestCount = await this.prisma.guest.count({
        where: { spaceId, attendance: { in: ['YES', 'MAYBE'] } },
      });

      const activeEvents = await this.prisma.event.findMany({
        where: { spaceId, status: 'LIVE' },
        select: { title: true, venue: true },
      });

      feedContext = {
        totalGuestsAttending: guestCount,
        spaceDate: space?.date,
        spaceStatus: space?.status,
        activeEvents,
        isEmpty: posts.length === 0,
        welcomeMessage: posts.length === 0 
          ? `Welcome to ${space?.name || 'the celebration'}! The feed will come alive once the party starts.` 
          : undefined,
      };
    }

    return { context: feedContext, posts, nextCursor };
  }

  async getTrending(spaceId: string) {
    // "Trending" = posts with the most reactions in the last 30 minutes
    const since = new Date(Date.now() - 30 * 60 * 1000);

    const posts = await this.prisma.feedPost.findMany({
      where: { spaceId, createdAt: { gte: since } },
      orderBy: { reactions: { _count: 'desc' } },
      take: 10,
      include: {
        guest: { select: { id: true, name: true, profileUrl: true } },
        mediaItems: {
          include: { media: { select: { id: true, url: true, type: true } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    return posts;
  }

  // -----------------------------------------------------------------
  // REACTIONS
  // -----------------------------------------------------------------

  async addReaction(dto: CreateReactionDto) {
    const { feedPostId, guestId, emoji } = dto;

    // Check post exists
    const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
    if (!post) throw new NotFoundException('Feed post not found');

    // Upsert: if guest already reacted with same emoji, it's idempotent
    let reaction: any;
    try {
      reaction = await this.prisma.reaction.create({
        data: { feedPostId, guestId, emoji },
        include: { guest: { select: { id: true, name: true } } },
      });
    } catch (e: any) {
      // P2002 = Unique constraint violation (already reacted)
      if (e.code === 'P2002') throw new ConflictException('Already reacted with this emoji');
      throw e;
    }

    // Get updated reaction counts
    const counts = await this.getReactionCounts(feedPostId);

    // Realtime broadcast
    this.gateway.broadcastToSpace(post.spaceId, 'server:reaction_created', {
      feedPostId,
      emoji,
      guestId,
      counts,
    });
    // Float across big screen
    this.gateway.broadcastToBigScreen(post.spaceId, 'bigscreen:float_reaction', { emoji, count: counts.total });

    return reaction;
  }

  async removeReaction(feedPostId: string, guestId: string, emoji: string) {
    const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
    if (!post) throw new NotFoundException('Feed post not found');

    await this.prisma.reaction.deleteMany({ where: { feedPostId, guestId, emoji } });

    const counts = await this.getReactionCounts(feedPostId);
    this.gateway.broadcastToSpace(post.spaceId, 'server:reaction_removed', { feedPostId, emoji, guestId, counts });

    return { removed: true };
  }

  private async getReactionCounts(feedPostId: string) {
    const reactions = await this.prisma.reaction.groupBy({
      by: ['emoji'],
      where: { feedPostId },
      _count: { emoji: true },
    });

    const total = reactions.reduce((sum, r) => sum + r._count.emoji, 0);
    const byEmoji = Object.fromEntries(reactions.map(r => [r.emoji, r._count.emoji]));
    return { total, byEmoji };
  }

  // -----------------------------------------------------------------
  // COMMENTS
  // -----------------------------------------------------------------

  async addComment(dto: CreateCommentDto) {
    const { feedPostId, guestId, text } = dto;

    const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
    if (!post) throw new NotFoundException('Feed post not found');

    const comment = await this.prisma.comment.create({
      data: { feedPostId, guestId, text },
      include: { guest: { select: { id: true, name: true, profileUrl: true } } },
    });

    // Realtime broadcast
    this.gateway.broadcastToSpace(post.spaceId, 'server:comment_created', comment);

    return comment;
  }

  async getComments(feedPostId: string, limit = 50) {
    const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
    if (!post) throw new NotFoundException('Feed post not found');

    return this.prisma.comment.findMany({
      where: { feedPostId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { guest: { select: { id: true, name: true, profileUrl: true } } },
    });
  }
}
