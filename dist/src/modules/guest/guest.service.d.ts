import { PrismaService } from '../../prisma/prisma.service';
import { JoinSpaceDto, UpdateParticipationDto } from './dto/participation.dto';
export declare class GuestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    joinSpace(userId: string, dto: JoinSpaceDto): Promise<{
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
    updateParticipation(guestId: string, dto: UpdateParticipationDto): Promise<{
        space: {
            id: string;
            name: string;
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
    }>;
    leaveSpace(userId: string, spaceId: string): Promise<{
        left: boolean;
        spaceId: string;
    }>;
    getSessionMe(userId: string): Promise<{
        id: string;
        phone: string;
        participations: {
            guestId: string;
            name: string;
            group: import(".prisma/client").$Enums.GuestGroup;
            relation: string;
            attendance: import(".prisma/client").$Enums.AttendanceStatus;
            hasArrived: boolean;
            isAdmin: boolean;
            profileUrl: string | null;
            space: {
                events: {
                    id: string;
                    status: import(".prisma/client").$Enums.EventStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string | null;
                    venue: string | null;
                    startTime: Date;
                    endTime: Date | null;
                    spaceId: string;
                }[];
                _count: {
                    guests: number;
                    feedPosts: number;
                };
            } & {
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
            devices: {
                id: string;
                createdAt: Date;
                deviceType: string | null;
            }[];
        }[];
    }>;
    getGuest(guestId: string): Promise<{
        user: {
            phone: string;
        };
        space: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.SpaceStatus;
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
    }>;
}
