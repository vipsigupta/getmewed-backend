import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { NotificationService } from '../notification/notification.service';
import { CreateEventDto, UpdateEventStatusDto, MarkArrivalDto } from './dto/event.dto';
export declare class EventService {
    private readonly prisma;
    private readonly gateway;
    private readonly notifications;
    constructor(prisma: PrismaService, gateway: EventsGateway | undefined, notifications: NotificationService);
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
    updateEventStatus(id: string, dto: UpdateEventStatusDto): Promise<{
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
    private getFirstAdminGuestId;
}
