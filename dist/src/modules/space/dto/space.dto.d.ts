import { SpaceStatus } from '@prisma/client';
export declare class CreateSpaceDto {
    name: string;
    theme?: string;
    coverUrl?: string;
    date: string;
}
export declare class UpdateSpaceStatusDto {
    status: SpaceStatus;
}
