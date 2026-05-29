import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (in a real app, do this in a separate config module or in main.ts)
// For MVP speed, we initialize here if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (e) {
    console.error('Failed to initialize Firebase Admin', e);
  }
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * 1. Decode Firebase Token & find/create User
   */
  async verifyFirebaseToken(idToken: string) {
    try {
      // In local dev without Firebase, mock this or actually verify if env is set
      // For MVP, if Firebase is missing, we can throw, but let's assume it's set
      if (!admin.apps.length) throw new Error('Firebase Admin not initialized');

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseUid, phone_number: phone } = decodedToken;

      if (!phone) {
        throw new UnauthorizedException('Phone number is missing from Firebase token');
      }

      const user = await this.findOrCreateUser(firebaseUid, phone);
      return { user, token: decodedToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }

  /**
   * 2. Find or Create the persistent User Identity
   */
  private async findOrCreateUser(firebaseUid: string, phone: string) {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          phone,
        },
      });
    }

    return user;
  }

  /**
   * 3. Join a specific Celebration Space as a Guest
   */
  async joinSpace(userId: string, spaceId: string, name: string, group?: any, relation?: string, attendance?: any) {
    // Verify space exists
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    // Upsert the Guest participation record to support profile completion
    const guest = await this.prisma.guest.upsert({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
      update: {
        name,
        group: group || undefined,
        relation: relation || undefined,
        attendance: attendance || undefined,
      },
      create: {
        name,
        group: group || 'GUEST',
        relation: relation || 'Guest',
        attendance: attendance || 'PENDING',
        userId,
        spaceId,
      },
    });

    return guest;
  }

  /**
   * 4. Validate Session (called by Auth Guards)
   */
  async validateSession(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        guests: {
          include: { space: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in system');
    }

    // isNewUser: true if the user has never completed their profile (no name saved)
    const isNewUser = !user.name;

    return { ...user, isNewUser };
  }

  async updateProfile(
    userId: string, 
    data: { 
      name?: string; 
      avatarUrl?: string;
      location?: string;
      profession?: string;
      email?: string;
    }
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
