import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { CreateSpaceDto, UpdateSpaceStatusDto } from './dto/space.dto';
export declare class SpaceService {
    private readonly prisma;
    private readonly gateway?;
    constructor(prisma: PrismaService, gateway?: EventsGateway | undefined);
    createSpace(dto: CreateSpaceDto): Promise<{
        id: string;
        name: string;
        theme: string | null;
        coverUrl: string | null;
        inviteCode: string;
        status: import(".prisma/client").$Enums.SpaceStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSpace(id: string): Promise<{
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
    }>;
    updateStatus(id: string, dto: UpdateSpaceStatusDto): Promise<{
        id: string;
        name: string;
        theme: string | null;
        coverUrl: string | null;
        inviteCode: string;
        status: import(".prisma/client").$Enums.SpaceStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getGuests(spaceId: string): Promise<({
        user: {
            phone: string;
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
    })[]>;
}
