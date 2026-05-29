import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class SupabaseStorageService {
  private readonly s3: S3Client;
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly BUCKET = 'avatars';
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('SUPABASE_S3_ENDPOINT')!;

    this.s3 = new S3Client({
      region: this.config.get<string>('SUPABASE_S3_REGION') || 'ap-south-1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.config.get<string>('SUPABASE_S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get<string>('SUPABASE_S3_SECRET_ACCESS_KEY')!,
      },
      forcePathStyle: true, // Required for Supabase S3-compatible API
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const ext = file.mimetype.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const key = `${userId}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Making it publicly readable
        ACL: 'public-read' as any,
      }),
    );

    // Supabase public URL format
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${this.BUCKET}/${key}`;

    this.logger.log(`Avatar uploaded for user ${userId}: ${publicUrl}`);
    return publicUrl;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const crypto = require('crypto');
    const ext = file.mimetype.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const key = `${crypto.randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as any,
      }),
    );

    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${this.BUCKET}/${key}`;

    this.logger.log(`General image uploaded: ${publicUrl}`);
    return publicUrl;
  }
}
