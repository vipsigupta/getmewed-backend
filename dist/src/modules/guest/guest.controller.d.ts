import { GuestService } from './guest.service';
import { JoinSpaceDto, UpdateParticipationDto } from './dto/participation.dto';
export declare class GuestController {
    private readonly guestService;
    constructor(guestService: GuestService);
    joinSpace(dto: JoinSpaceDto, req: any): Promise<{
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
    leaveSpace(spaceId: string, req: any): Promise<{
        left: boolean;
        spaceId: string;
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
