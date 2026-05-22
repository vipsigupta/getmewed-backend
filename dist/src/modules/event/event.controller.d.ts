import { EventService } from './event.service';
import { CreateEventDto, UpdateEventStatusDto, MarkArrivalDto } from './dto/event.dto';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    createEvent(dto: CreateEventDto): Promise<{
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
    }>;
    getEvents(spaceId: string): Promise<({
        _count: {
            performances: number;
        };
    } & {
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
    })[]>;
    updateStatus(id: string, dto: UpdateEventStatusDto): Promise<{
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
    }>;
    markArrival(dto: MarkArrivalDto): Promise<{
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
    }>;
}
