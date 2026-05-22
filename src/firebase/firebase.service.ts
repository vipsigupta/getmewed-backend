import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.initialized = true;
      return;
    }

    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!raw) {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set — FCM push disabled');
        return;
      }

      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.initialized = true;
      this.logger.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`);
    } catch (e) {
      this.logger.error('Failed to initialize Firebase Admin SDK', e);
    }
  }

  /**
   * Send a push notification to a list of FCM device tokens.
   * Automatically batches into chunks of 500 (FCM multicast limit).
   */
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.initialized || tokens.length === 0) return;

    const CHUNK = 500;
    const messaging = admin.messaging();

    for (let i = 0; i < tokens.length; i += CHUNK) {
      const chunk = tokens.slice(i, i + CHUNK);
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title, body },
          data: data || {},
          android: {
            priority: 'high',
            notification: { sound: 'default' },
          },
          apns: {
            payload: {
              aps: { sound: 'default', badge: 1 },
            },
          },
        });
        this.logger.log(
          `FCM sent: ${response.successCount} success, ${response.failureCount} failed`,
        );
      } catch (err) {
        this.logger.error('FCM multicast error', err);
      }
    }
  }

  /**
   * Verify a Firebase ID Token from the Flutter client.
   * Returns the decoded token (with uid, phone_number, etc.)
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.initialized) throw new Error('Firebase Admin not initialized');
    return admin.auth().verifyIdToken(idToken);
  }

  isReady(): boolean {
    return this.initialized;
  }
}
