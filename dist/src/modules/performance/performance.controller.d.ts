import { PerformanceService } from './performance.service';
import { CreatePerformanceDto, UpdatePerformanceStatusDto, ReorderPerformanceDto } from './dto/performance.dto';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
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
}
