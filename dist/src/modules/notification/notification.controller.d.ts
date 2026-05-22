import { NotificationService, BroadcastDto } from './notification.service';
import { RegisterDeviceDto, RemoveDeviceDto } from './dto/device.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
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
    broadcast(dto: BroadcastDto): Promise<{
        sent: number;
        title: string;
    }>;
}
