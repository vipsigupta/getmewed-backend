import { GuestGroup } from '@prisma/client';
export declare class VerifyTokenDto {
    idToken: string;
}
export declare class JoinSpaceDto {
    spaceId: string;
    name: string;
    group?: GuestGroup;
    relation?: string;
}
