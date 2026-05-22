import { PrismaService } from '../../prisma/prisma.service';
import { MediaType } from '@prisma/client';
export declare class MediaService {
    private readonly prisma;
    private supabase;
    constructor(prisma: PrismaService);
    getUploadUrl(filename: string, type: MediaType, spaceId: string, guestId: string): Promise<{
        mediaId: string;
        uploadUrl: string;
        publicUrl: string;
        expiresIn: number;
    }>;
}
