export declare const NotificationTemplates: {
    readonly spaceLive: (spaceName: string) => {
        title: string;
        body: string;
    };
    readonly eventLive: (eventTitle: string, venue?: string) => {
        title: string;
        body: string;
    };
    readonly eventCompleted: (eventTitle: string) => {
        title: string;
        body: string;
    };
    readonly performanceLive: (performers: string, song?: string) => {
        title: string;
        body: string;
    };
    readonly performanceNext: (performers: string) => {
        title: string;
        body: string;
    };
    readonly guestArrived: (guestName: string, relation: string) => {
        title: string;
        body: string;
    };
    readonly newMediaDump: (count: number) => {
        title: string;
        body: string;
    };
    readonly postTrending: (guestName: string) => {
        title: string;
        body: string;
    };
    readonly adminBroadcast: (title: string, body: string) => {
        title: string;
        body: string;
    };
    readonly dinnerOpen: () => {
        title: string;
        body: string;
    };
    readonly countdown: (daysLeft: number, spaceName: string) => {
        title: string;
        body: string;
    };
};
