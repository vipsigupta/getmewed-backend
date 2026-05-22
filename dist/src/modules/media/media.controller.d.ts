import { MediaService } from './media.service';
import { GetUploadUrlDto } from './dto/media.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getUploadUrl(dto: GetUploadUrlDto): Promise<{
        mediaId: string;
        uploadUrl: string;
        publicUrl: string;
        expiresIn: number;
    }>;
}
