import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyTokenDto, JoinSpaceDto } from './dto/auth.dto';
// Note: In a real app, we'd have a FirebaseAuthGuard that sets req.user. For MVP speed, we'll manually extract the token or mock the guard.

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  async verify(@Body() body: VerifyTokenDto) {
    const result = await this.authService.verifyFirebaseToken(body.idToken);
    return {
      message: 'Authentication successful',
      user: result.user,
    };
  }

  @Post('join-space')
  async joinSpace(@Body() body: JoinSpaceDto, @Request() req: any) {
    // In a guarded route, req.user would have the userId from validateSession.
    // Assuming we pass userId manually for MVP if guard isn't active, but ideally the client sends the Bearer token
    // For simplicity, let's assume the user sends their firebaseUid or internal userId in headers, or we use a Guard.
    // If we use a Guard, we extract userId from req.user.id
    const userId = req.user?.id || req.headers['x-user-id']; // Fallback for MVP testing
    if (!userId) {
      throw new Error('User ID required in headers (x-user-id) or auth context');
    }

    const guest = await this.authService.joinSpace(
      userId,
      body.spaceId,
      body.name,
      body.group,
      body.relation,
    );

    return {
      message: 'Joined space successfully',
      guest,
    };
  }

  @Get('session')
  async getSession(@Request() req: any) {
    const firebaseUid = req.user?.firebaseUid || req.headers['x-firebase-uid'];
    if (!firebaseUid) {
      throw new Error('Firebase UID required in headers (x-firebase-uid) or auth context');
    }

    const user = await this.authService.validateSession(firebaseUid);
    return {
      user,
    };
  }
}
