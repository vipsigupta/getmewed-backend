import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { NotificationService } from '../notification/notification.service';
import { CreatePerformanceDto, UpdatePerformanceStatusDto, ReorderPerformanceDto } from './dto/performance.dto';
export declare class PerformanceService {
    private readonly prisma;
    private readonly gateway;
    private readonly notifications;
    constructor(prisma: PrismaService, gateway: EventsGateway, notifications: NotificationService);
    create(dto: CreatePerformanceDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PerformanceStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        spaceId: string;
        eventId: string | null;
        performers: string;
        songName: string | null;
        sequence: number;
    }>;
    getQueue(spaceId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PerformanceStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        spaceId: string;
        eventId: string | null;
        performers: string;
        songName: string | null;
        sequence: number;
    }[]>;
    updateStatus(id: string, dto: UpdatePerformanceStatusDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PerformanceStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        spaceId: string;
        eventId: string | null;
        performers: string;
        songName: string | null;
        sequence: number;
    }>;
    reorder(spaceId: string, dto: ReorderPerformanceDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PerformanceStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        spaceId: string;
        eventId: string | null;
        performers: string;
        songName: string | null;
        sequence: number;
    }[]>;
    private broadcastQueue;
    private getFirstAdminGuestId;
}
