import { PerformanceStatus } from '@prisma/client';
export declare class CreatePerformanceDto {
    title: string;
    performers: string;
    songName?: string;
    sequence: number;
    spaceId: string;
    eventId?: string;
}
export declare class UpdatePerformanceStatusDto {
    status: PerformanceStatus;
}
export declare class ReorderPerformanceDto {
    performanceId: string;
    newSequence: number;
}
