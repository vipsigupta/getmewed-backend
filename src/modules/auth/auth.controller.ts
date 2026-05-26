import { 
  Controller, Post, Get, Patch, Body, UseGuards, 
  Request, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { VerifyTokenDto, JoinSpaceDto } from './dto/auth.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { SupabaseStorageService } from './supabase-storage.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Post('verify')
  async verify(@Body() body: VerifyTokenDto) {
    const result = await this.authService.verifyFirebaseToken(body.idToken);
    return {
      message: 'Authentication successful',
      user: result.user,
    };
  }

  @Post('join-space')
  @UseGuards(FirebaseAuthGuard)
  async joinSpace(@Body() body: JoinSpaceDto, @Request() req: any) {
    const userId = req.user.id;
    const guest = await this.authService.joinSpace(
      userId,
      body.spaceId,
      body.name,
      body.group,
      body.relation,
      body.attendance,
    );
    return { message: 'Joined space successfully', guest };
  }

  @Get('session')
  @UseGuards(FirebaseAuthGuard)
  async getSession(@Request() req: any) {
    const firebaseUid = req.user.firebaseUid;
    const user = await this.authService.validateSession(firebaseUid);
    return { user };
  }

  @Patch('profile')
  @UseGuards(FirebaseAuthGuard)
  async updateProfile(@Body() body: { name?: string; avatarUrl?: string }, @Request() req: any) {
    const userId = req.user.id;
    const user = await this.authService.updateProfile(userId, body);
    return { message: 'Profile updated successfully', user };
  }

  /**
   * POST /auth/upload-avatar
   * Accepts a multipart file, uploads it to Supabase Storage,
   * and returns the permanent public URL.
   */
  @Post('upload-avatar')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })) // 5MB limit
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const avatarUrl = await this.storageService.uploadAvatar(file, userId);

    // Immediately save it to the user's profile
    await this.authService.updateProfile(userId, { avatarUrl });

    return { avatarUrl };
  }
}
