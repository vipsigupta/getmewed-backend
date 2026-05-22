import { MediaType } from '@prisma/client';
export declare class GetUploadUrlDto {
    filename: string;
    type: MediaType;
    spaceId: string;
    guestId: string;
}
