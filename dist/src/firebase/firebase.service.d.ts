import { OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private readonly logger;
    private initialized;
    onModuleInit(): void;
    sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    isReady(): boolean;
}
