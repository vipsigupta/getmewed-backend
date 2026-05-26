import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // DEV BYPASS: Allow local testing without real Firebase Auth
      // Token format: mock_firebase_token_{phoneNumber}
      if (idToken.startsWith('mock_firebase_token_')) {
        const phone = idToken.replace('mock_firebase_token_', '');
        const testUser = await this.prisma.user.upsert({
          where: { phone },
          update: {},
          create: {
            phone,
            firebaseUid: `mock_uid_${phone}`,
          },
        });
        request.user = testUser;
        return true;
      }

      // 1. Verify token with Firebase Admin
      const decodedToken = await this.firebase.verifyIdToken(idToken);
      
      // 2. Map Firebase UID to internal User
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user) {
        throw new UnauthorizedException('User not found in system. Please verify OTP first.');
      }

      // 3. Attach internal user to request
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }
}
