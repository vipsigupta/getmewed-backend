import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    verifyFirebaseToken(idToken: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firebaseUid: string;
            phone: string;
        };
        token: import("firebase-admin/lib/auth/token-verifier").DecodedIdToken;
    }>;
    private findOrCreateUser;
    joinSpace(userId: string, spaceId: string, name: string, group?: any, relation?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        group: import(".prisma/client").$Enums.GuestGroup;
        relation: string;
        attendance: import(".prisma/client").$Enums.AttendanceStatus;
        hasArrived: boolean;
        profileUrl: string | null;
        isAdmin: boolean;
        userId: string;
        spaceId: string;
    }>;
    validateSession(firebaseUid: string): Promise<{
        guests: ({
            space: {
                id: string;
                name: string;
                theme: string | null;
                coverUrl: string | null;
                inviteCode: string;
                status: import(".prisma/client").$Enums.SpaceStatus;
                date: Date;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            group: import(".prisma/client").$Enums.GuestGroup;
            relation: string;
            attendance: import(".prisma/client").$Enums.AttendanceStatus;
            hasArrived: boolean;
            profileUrl: string | null;
            isAdmin: boolean;
            userId: string;
            spaceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firebaseUid: string;
        phone: string;
    }>;
}
