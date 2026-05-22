"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplates = void 0;
exports.NotificationTemplates = {
    spaceLive: (spaceName) => ({
        title: `🎉 ${spaceName} is now LIVE!`,
        body: "The celebration has officially begun. Join in right now!",
    }),
    eventLive: (eventTitle, venue) => ({
        title: `✨ ${eventTitle} is Live!`,
        body: venue
            ? `Head over to ${venue} — it's starting right now!`
            : "Something exciting is happening right now. Don't miss it!",
    }),
    eventCompleted: (eventTitle) => ({
        title: `${eventTitle} has wrapped up!`,
        body: "Check the feed for the best moments from the celebration.",
    }),
    performanceLive: (performers, song) => ({
        title: `🔥 ${performers} are on stage!`,
        body: song
            ? `They're performing "${song}" LIVE right now. Send your reactions!`
            : "They are performing LIVE right now. Open the app and send your reactions!",
    }),
    performanceNext: (performers) => ({
        title: `🎤 Up Next: ${performers}`,
        body: "Get ready to cheer! They take the stage in 2 minutes.",
    }),
    guestArrived: (guestName, relation) => ({
        title: `✨ ${guestName} has arrived!`,
        body: `${relation} just checked into the celebration. Give them a warm welcome!`,
    }),
    newMediaDump: (count) => ({
        title: `📸 ${count} new moments uploaded!`,
        body: "Don't miss the latest memories from the celebration.",
    }),
    postTrending: (guestName) => ({
        title: `❤️ Your photo is trending!`,
        body: `${guestName} and many others are loving your post right now.`,
    }),
    adminBroadcast: (title, body) => ({ title, body }),
    dinnerOpen: () => ({
        title: `🍽 Dinner is now served!`,
        body: "Head to the dining area — the feast awaits!",
    }),
    countdown: (daysLeft, spaceName) => ({
        title: `⏳ ${daysLeft} day${daysLeft > 1 ? 's' : ''} to go!`,
        body: `${spaceName} is almost here. Get ready to celebrate!`,
    }),
};
//# sourceMappingURL=notification.templates.js.map