import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { MediaType } from '@prisma/client';

const BUCKET_NAME = 'space-media';
const UPLOAD_URL_EXPIRY = 300; // 5 minutes

@Injectable()
export class MediaService {
  private supabase;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Generate a short-lived presigned URL for the Flutter client to upload directly to Supabase Storage.
   * After upload, client calls POST /feed/create with the returned mediaId.
   */
  async getUploadUrl(filename: string, type: MediaType, spaceId: string, guestId: string) {
    const ext = filename.split('.').pop() || 'bin';
    const supabaseRef = `${spaceId}/${guestId}/${crypto.randomUUID()}.${ext}`;

    // Create a signed upload URL (client uploads directly to Supabase)
    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(supabaseRef);

    if (error) throw new Error(`Supabase storage error: ${error.message}`);

    // Public URL that will be used after upload completes
    const { data: publicData } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(supabaseRef);

    // Pre-create the Media record so the client has the ID to attach to FeedPosts
    const media = await this.prisma.media.create({
      data: {
        type,
        url: publicData.publicUrl,
        supabaseRef,
        spaceId,
        guestId,
      },
    });

    return {
      mediaId: media.id,            // Use this in POST /feed/create -> mediaIds[]
      uploadUrl: data.signedUrl,    // Flutter client PUTs the file here
      publicUrl: publicData.publicUrl,
      expiresIn: UPLOAD_URL_EXPIRY,
    };
  }
}
