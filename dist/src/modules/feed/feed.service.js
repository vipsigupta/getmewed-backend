"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const events_gateway_1 = require("../../websocket/events.gateway");
let FeedService = class FeedService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async createPost(dto) {
        const { spaceId, guestId, type, content, eventId, mediaIds } = dto;
        const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest || guest.spaceId !== spaceId) {
            throw new common_1.NotFoundException('Guest not found in this space');
        }
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
        this.gateway.broadcastToSpace(spaceId, 'server:feed_updated', post);
        this.gateway.broadcastToBigScreen(spaceId, 'bigscreen:live_feed', post);
        return post;
    }
    async getFeed(spaceId, cursor, limit = 20) {
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
        return { posts, nextCursor };
    }
    async getTrending(spaceId) {
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
    async addReaction(dto) {
        const { feedPostId, guestId, emoji } = dto;
        const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
        if (!post)
            throw new common_1.NotFoundException('Feed post not found');
        let reaction;
        try {
            reaction = await this.prisma.reaction.create({
                data: { feedPostId, guestId, emoji },
                include: { guest: { select: { id: true, name: true } } },
            });
        }
        catch (e) {
            if (e.code === 'P2002')
                throw new common_1.ConflictException('Already reacted with this emoji');
            throw e;
        }
        const counts = await this.getReactionCounts(feedPostId);
        this.gateway.broadcastToSpace(post.spaceId, 'server:reaction_created', {
            feedPostId,
            emoji,
            guestId,
            counts,
        });
        this.gateway.broadcastToBigScreen(post.spaceId, 'bigscreen:float_reaction', { emoji, count: counts.total });
        return reaction;
    }
    async removeReaction(feedPostId, guestId, emoji) {
        const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
        if (!post)
            throw new common_1.NotFoundException('Feed post not found');
        await this.prisma.reaction.deleteMany({ where: { feedPostId, guestId, emoji } });
        const counts = await this.getReactionCounts(feedPostId);
        this.gateway.broadcastToSpace(post.spaceId, 'server:reaction_removed', { feedPostId, emoji, guestId, counts });
        return { removed: true };
    }
    async getReactionCounts(feedPostId) {
        const reactions = await this.prisma.reaction.groupBy({
            by: ['emoji'],
            where: { feedPostId },
            _count: { emoji: true },
        });
        const total = reactions.reduce((sum, r) => sum + r._count.emoji, 0);
        const byEmoji = Object.fromEntries(reactions.map(r => [r.emoji, r._count.emoji]));
        return { total, byEmoji };
    }
    async addComment(dto) {
        const { feedPostId, guestId, text } = dto;
        const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
        if (!post)
            throw new common_1.NotFoundException('Feed post not found');
        const comment = await this.prisma.comment.create({
            data: { feedPostId, guestId, text },
            include: { guest: { select: { id: true, name: true, profileUrl: true } } },
        });
        this.gateway.broadcastToSpace(post.spaceId, 'server:comment_created', comment);
        return comment;
    }
    async getComments(feedPostId, limit = 50) {
        const post = await this.prisma.feedPost.findUnique({ where: { id: feedPostId } });
        if (!post)
            throw new common_1.NotFoundException('Feed post not found');
        return this.prisma.comment.findMany({
            where: { feedPostId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            include: { guest: { select: { id: true, name: true, profileUrl: true } } },
        });
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], FeedService);
//# sourceMappingURL=feed.service.js.map