import { GuestService } from '../guest/guest.service';
export declare class SessionController {
    private readonly guestService;
    constructor(guestService: GuestService);
    getMe(req: any): Promise<{
        id: string;
        phone: string;
        participations: {
            guestId: string;
            name: string;
            group: import(".prisma/client").$Enums.GuestGroup;
            relation: string;
            attendance: import(".prisma/client").$Enums.AttendanceStatus;
            hasArrived: boolean;
            isAdmin: boolean;
            profileUrl: string | null;
            space: {
                events: {
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
                }[];
                _count: {
                    guests: number;
                    feedPosts: number;
                };
            } & {
                id: string;
                name: string;
                theme: string | null;
                coverUrl: string | null;
                inviteCode: string;
                status: import(".prisma/client").$Enums.SpaceStatus;
                date: Date;
                createdAt: Date;
                updatedAt: Date;
            };
            devices: {
                id: string;
                createdAt: Date;
                deviceType: string | null;
            }[];
        }[];
    }>;
}
