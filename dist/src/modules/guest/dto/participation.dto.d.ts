import { GuestGroup, AttendanceStatus } from '@prisma/client';
export declare class JoinSpaceDto {
    inviteCode: string;
    name: string;
    group?: GuestGroup;
    relation?: string;
    profileUrl?: string;
}
export declare class UpdateParticipationDto {
    name?: string;
    group?: GuestGroup;
    relation?: string;
    attendance?: AttendanceStatus;
    profileUrl?: string;
}
export declare class LeaveSpaceDto {
    spaceId: string;
}
