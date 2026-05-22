import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { RegisterDeviceDto, RemoveDeviceDto } from './dto/device.dto';
export declare class BroadcastDto {
    spaceId: string;
    title: string;
    body: string;
}
export declare class NotificationService {
    private readonly prisma;
    private readonly firebase;
    private readonly logger;
    constructor(prisma: PrismaService, firebase: FirebaseService);
    registerDevice(dto: RegisterDeviceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestId: string;
        token: string;
        deviceType: string | null;
    }>;
    removeDevice(dto: RemoveDeviceDto): Promise<{
        removed: boolean;
        token: string;
    }>;
    getGuestDevices(guestId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestId: string;
        token: string;
        deviceType: string | null;
    }[]>;
    getSpaceTokens(spaceId: string): Promise<string[]>;
    getActiveGuestTokens(spaceId: string): Promise<string[]>;
    getAdminTokens(spaceId: string): Promise<string[]>;
    notifyEventLive(spaceId: string, eventTitle: string, venue?: string): Promise<void>;
    notifyPerformanceLive(spaceId: string, performers: string, songName?: string): Promise<void>;
    notifyGuestArrived(spaceId: string, guestName: string, relation: string): Promise<void>;
    notifySpaceLive(spaceId: string, spaceName: string): Promise<void>;
    broadcast(dto: BroadcastDto): Promise<{
        sent: number;
        title: string;
    }>;
    private persistNotification;
}
