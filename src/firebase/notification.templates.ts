/**
 * Centralized notification template factory.
 * All FCM notifications should be composed from these templates
 * to maintain consistent emotional tone across the platform.
 */
export const NotificationTemplates = {
  // ── Space Lifecycle ──────────────────────────────────────────────
  spaceLive: (spaceName: string) => ({
    title: `🎉 ${spaceName} is now LIVE!`,
    body: "The celebration has officially begun. Join in right now!",
  }),

  // ── Events ───────────────────────────────────────────────────────
  eventLive: (eventTitle: string, venue?: string) => ({
    title: `✨ ${eventTitle} is Live!`,
    body: venue
      ? `Head over to ${venue} — it's starting right now!`
      : "Something exciting is happening right now. Don't miss it!",
  }),

  eventCompleted: (eventTitle: string) => ({
    title: `${eventTitle} has wrapped up!`,
    body: "Check the feed for the best moments from the celebration.",
  }),

  // ── Performances ─────────────────────────────────────────────────
  performanceLive: (performers: string, song?: string) => ({
    title: `🔥 ${performers} are on stage!`,
    body: song
      ? `They're performing "${song}" LIVE right now. Send your reactions!`
      : "They are performing LIVE right now. Open the app and send your reactions!",
  }),

  performanceNext: (performers: string) => ({
    title: `🎤 Up Next: ${performers}`,
    body: "Get ready to cheer! They take the stage in 2 minutes.",
  }),

  // ── Guest Arrivals ───────────────────────────────────────────────
  guestArrived: (guestName: string, relation: string) => ({
    title: `✨ ${guestName} has arrived!`,
    body: `${relation} just checked into the celebration. Give them a warm welcome!`,
  }),

  // ── Feed & Media ─────────────────────────────────────────────────
  newMediaDump: (count: number) => ({
    title: `📸 ${count} new moments uploaded!`,
    body: "Don't miss the latest memories from the celebration.",
  }),

  postTrending: (guestName: string) => ({
    title: `❤️ Your photo is trending!`,
    body: `${guestName} and many others are loving your post right now.`,
  }),

  // ── Admin Broadcasts ─────────────────────────────────────────────
  adminBroadcast: (title: string, body: string) => ({ title, body }),

  // ── Coordination ─────────────────────────────────────────────────
  dinnerOpen: () => ({
    title: `🍽 Dinner is now served!`,
    body: "Head to the dining area — the feast awaits!",
  }),

  countdown: (daysLeft: number, spaceName: string) => ({
    title: `⏳ ${daysLeft} day${daysLeft > 1 ? 's' : ''} to go!`,
    body: `${spaceName} is almost here. Get ready to celebrate!`,
  }),
} as const;
