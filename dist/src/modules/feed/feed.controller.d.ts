import { FeedService } from './feed.service';
import { CreateFeedPostDto, CreateReactionDto, CreateCommentDto } from './dto/feed.dto';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    createPost(dto: CreateFeedPostDto): Promise<{
        guest: {
            id: string;
            name: string;
            group: import(".prisma/client").$Enums.GuestGroup;
            profileUrl: string | null;
        };
        _count: {
            reactions: number;
            comments: number;
        };
        mediaItems: ({
            media: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                guestId: string | null;
                type: import(".prisma/client").$Enums.MediaType;
                spaceId: string;
                url: string;
                supabaseRef: string | null;
            };
        } & {
            id: string;
            feedPostId: string;
            order: number;
            mediaId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestId: string;
        type: import(".prisma/client").$Enums.FeedPostType;
        content: string | null;
        spaceId: string;
        eventId: string | null;
    }>;
    getFeed(spaceId: string, cursor?: string, limit?: string): Promise<{
        posts: ({
            guest: {
                id: string;
                name: string;
                group: import(".prisma/client").$Enums.GuestGroup;
                profileUrl: string | null;
            };
            _count: {
                reactions: number;
                comments: number;
            };
            mediaItems: ({
                media: {
                    id: string;
                    type: import(".prisma/client").$Enums.MediaType;
                    url: string;
                };
            } & {
                id: string;
                feedPostId: string;
                order: number;
                mediaId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            guestId: string;
            type: import(".prisma/client").$Enums.FeedPostType;
            content: string | null;
            spaceId: string;
            eventId: string | null;
        })[];
        nextCursor: string | null;
    }>;
    getTrending(spaceId: string): Promise<({
        guest: {
            id: string;
            name: string;
            profileUrl: string | null;
        };
        _count: {
            reactions: number;
            comments: number;
        };
        mediaItems: ({
            media: {
                id: string;
                type: import(".prisma/client").$Enums.MediaType;
                url: string;
            };
        } & {
            id: string;
            feedPostId: string;
            order: number;
            mediaId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestId: string;
        type: import(".prisma/client").$Enums.FeedPostType;
        content: string | null;
        spaceId: string;
        eventId: string | null;
    })[]>;
    addReaction(dto: CreateReactionDto): Promise<any>;
    removeReaction(postId: string, guestId: string, emoji: string): Promise<{
        removed: boolean;
    }>;
    addComment(dto: CreateCommentDto): Promise<{
        guest: {
            id: string;
            name: string;
            profileUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        feedPostId: string;
        guestId: string;
        text: string;
    }>;
    getComments(postId: string, limit?: string): Promise<({
        guest: {
            id: string;
            name: string;
            profileUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        feedPostId: string;
        guestId: string;
        text: string;
    })[]>;
}
