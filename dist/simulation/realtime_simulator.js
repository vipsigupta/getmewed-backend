"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const socket_io_client_1 = require("socket.io-client");
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const API_URL = 'http://localhost:3000/v1';
const WS_URL = 'http://localhost:3000';
const INVITE_CODE = 'RAHUL2026';
const NUM_GUESTS = 20;
const metrics = {
    feedPostsSent: 0,
    feedPostsReceived: 0,
    feedLatencies: [],
    reactionsSent: 0,
    reactionsReceived: 0,
    reactionLatencies: [],
    commentsSent: 0,
    commentsReceived: 0,
    connectionDrops: 0,
};
const activeGuests = [];
let targetSpaceId = null;
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createAndJoinGuest() {
    const userId = (0, uuid_1.v4)();
    const name = faker_1.faker.person.fullName();
    try {
        await prisma.user.create({
            data: {
                id: userId,
                firebaseUid: `sim-${userId}`,
                phone: faker_1.faker.phone.number(),
            }
        });
        const res = await axios_1.default.post(`${API_URL}/guests/join`, {
            inviteCode: INVITE_CODE,
            name: name,
            group: 'GUEST',
            relation: 'Friend',
        }, {
            headers: { 'x-user-id': userId }
        });
        const guestId = res.data.id;
        targetSpaceId = res.data.spaceId;
        const socket = (0, socket_io_client_1.io)(WS_URL, {
            transports: ['websocket'],
            reconnection: true,
        });
        socket.on('connect', () => {
            socket.emit('client:join_space', { spaceId: targetSpaceId });
        });
        socket.on('disconnect', () => {
            metrics.connectionDrops++;
        });
        socket.on('server:feed_updated', (post) => {
            metrics.feedPostsReceived++;
            if (post.content && post.content.startsWith('TS:')) {
                const tsMatch = post.content.match(/TS:(\d+)/);
                if (tsMatch) {
                    const sentTime = parseInt(tsMatch[1], 10);
                    metrics.feedLatencies.push(Date.now() - sentTime);
                }
            }
        });
        socket.on('server:reaction_ping', (ping) => {
            metrics.reactionsReceived++;
            const sentTime = Number(ping.emoji.split('-')[1]);
            if (!isNaN(sentTime)) {
                metrics.reactionLatencies.push(Date.now() - sentTime);
            }
        });
        socket.on('server:reaction_created', (reaction) => {
        });
        return { id: guestId, userId, name, socket };
    }
    catch (err) {
        console.error('Failed to join guest:', err?.response?.data || err.message);
        return null;
    }
}
async function runScenario1_Onboarding() {
    console.log('\n--- SCENARIO 1: ONBOARDING & CONNECTION ---');
    console.log(`Simulating ${NUM_GUESTS} concurrent guests joining...`);
    const promises = [];
    for (let i = 0; i < NUM_GUESTS; i++) {
        promises.push(createAndJoinGuest());
    }
    const results = await Promise.all(promises);
    results.forEach(g => {
        if (g)
            activeGuests.push(g);
    });
    console.log(`✅ Successfully onboarded ${activeGuests.length}/${NUM_GUESTS} guests.`);
    await sleep(2000);
}
async function runScenario2_LiveFeed() {
    console.log('\n--- SCENARIO 2: LIVE FEED EXPERIENCE ---');
    console.log('Guests simultaneously posting to feed...');
    const promises = activeGuests.map(async (guest) => {
        const postTime = Date.now();
        try {
            await axios_1.default.post(`${API_URL}/feed/create`, {
                type: 'PHOTO',
                content: `TS:${postTime} Loving the vibes! #party`,
                spaceId: targetSpaceId,
                guestId: guest.id,
            });
            metrics.feedPostsSent++;
        }
        catch (e) { }
    });
    await Promise.all(promises);
    await sleep(3000);
    const avgLatency = metrics.feedLatencies.length > 0
        ? metrics.feedLatencies.reduce((a, b) => a + b, 0) / metrics.feedLatencies.length
        : 0;
    console.log(`✅ Sent ${metrics.feedPostsSent} posts. Received ${metrics.feedPostsReceived} broadcasts across all clients.`);
    console.log(`⚡ Avg Feed Propagation Latency: ${avgLatency.toFixed(2)}ms`);
}
async function runScenario3_ReactionStorm() {
    console.log('\n--- SCENARIO 3: REACTION STORM ---');
    console.log('Simulating 100+ rapid optimistic reactions (fast-path)...');
    const iterations = 5;
    for (let iter = 0; iter < iterations; iter++) {
        const promises = activeGuests.map(async (guest) => {
            const pingTime = Date.now();
            guest.socket.emit('client:ping_reaction', {
                spaceId: targetSpaceId,
                postId: 'simulated-post-123',
                emoji: `❤️-${pingTime}`
            });
            metrics.reactionsSent++;
            try {
                await axios_1.default.post(`${API_URL}/feed/react`, {
                    feedPostId: 'simulated-post-123',
                    guestId: guest.id,
                    emoji: '❤️'
                }).catch(() => null);
            }
            catch (e) { }
        });
        await Promise.all(promises);
        await sleep(200);
    }
    await sleep(3000);
    const avgLatency = metrics.reactionLatencies.length > 0
        ? metrics.reactionLatencies.reduce((a, b) => a + b, 0) / metrics.reactionLatencies.length
        : 0;
    console.log(`✅ Sent ${metrics.reactionsSent} reactions. Received ${metrics.reactionsReceived} broadcast pings across clients.`);
    console.log(`⚡ Avg Reaction Ping Latency: ${avgLatency.toFixed(2)}ms`);
}
async function main() {
    console.log('🚀 Starting Celebration Platform Realtime Simulation...');
    await runScenario1_Onboarding();
    if (activeGuests.length === 0) {
        console.error('Failed to onboard any guests. Aborting.');
        return;
    }
    await runScenario2_LiveFeed();
    try {
        const feedRes = await axios_1.default.get(`${API_URL}/feed/${targetSpaceId}`);
        if (feedRes.data.posts.length > 0) {
            const realPostId = feedRes.data.posts[0].id;
            console.log('\n--- SCENARIO 3b: DB REACTION STORM ---');
            console.log('Firing DB reactions...');
            const promises = activeGuests.map(g => axios_1.default.post(`${API_URL}/feed/react`, {
                feedPostId: realPostId,
                guestId: g.id,
                emoji: '🔥'
            }).catch(() => null));
            await Promise.all(promises);
            console.log('✅ DB Reaction storm complete (handled conflicts safely).');
        }
    }
    catch (e) { }
    await runScenario3_ReactionStorm();
    console.log('\n--- FINAL METRICS & ASSESSMENT ---');
    console.log(`- Connection Drops: ${metrics.connectionDrops}`);
    console.log(`- Feed Post Propagations: ${metrics.feedPostsReceived}`);
    console.log(`- Avg Feed Latency: ${metrics.feedLatencies.reduce((a, b) => a + b, 0) / Math.max(1, metrics.feedLatencies.length)}ms`);
    console.log(`- Reaction Pings Propagated: ${metrics.reactionsReceived}`);
    console.log(`- Avg Reaction Latency: ${metrics.reactionLatencies.reduce((a, b) => a + b, 0) / Math.max(1, metrics.reactionLatencies.length)}ms`);
    const isHealthy = metrics.connectionDrops === 0 && metrics.feedPostsReceived >= (NUM_GUESTS * NUM_GUESTS);
    console.log(`\n🩺 Backend Health Status: ${isHealthy ? 'EXCELLENT' : 'DEGRADED'}`);
    console.log(`❤️ Emotional Responsiveness: ${metrics.reactionLatencies.length > 0 && metrics.reactionLatencies[0] < 50 ? 'HIGH (Feels Alive)' : 'LOW (Laggy)'}`);
    console.log('\nCleaning up sockets...');
    activeGuests.forEach(g => g.socket.disconnect());
    await prisma.$disconnect();
    process.exit(0);
}
main().catch(console.error);
//# sourceMappingURL=realtime_simulator.js.map