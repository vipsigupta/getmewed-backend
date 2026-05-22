import { AuthService } from './auth.service';
import { VerifyTokenDto, JoinSpaceDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    verify(body: VerifyTokenDto): Promise<{
        message: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firebaseUid: string;
            phone: string;
        };
    }>;
    joinSpace(body: JoinSpaceDto, req: any): Promise<{
        message: string;
        guest: {
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
        };
    }>;
    getSession(req: any): Promise<{
        user: {
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
        };
    }>;
}
