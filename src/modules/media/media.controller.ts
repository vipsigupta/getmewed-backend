import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { GetUploadUrlDto } from './dto/media.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.mediaService.getUploadUrl(dto.filename, dto.type, dto.spaceId, dto.guestId);
  }
}
