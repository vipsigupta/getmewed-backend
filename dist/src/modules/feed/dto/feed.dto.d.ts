import { FeedPostType } from '@prisma/client';
export declare class CreateFeedPostDto {
    type: FeedPostType;
    content?: string;
    spaceId: string;
    guestId: string;
    eventId?: string;
    mediaIds?: string[];
}
export declare class CreateReactionDto {
    feedPostId: string;
    guestId: string;
    emoji: string;
}
export declare class CreateCommentDto {
    feedPostId: string;
    guestId: string;
    text: string;
}
export declare class GetFeedDto {
    spaceId: string;
    cursor?: string;
    limit?: number;
}
