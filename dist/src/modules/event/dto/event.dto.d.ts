import { EventStatus } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    description?: string;
    venue?: string;
    startTime: string;
    endTime?: string;
    spaceId: string;
}
export declare class UpdateEventStatusDto {
    status: EventStatus;
}
export declare class MarkArrivalDto {
    guestId: string;
}
