# Wedding Space - Backend Product Context & Architecture

## 1. Core Identity
**Wedding Space** is a LIVE INTERACTIVE WEDDING SOCIAL PLATFORM. 
It is a private social network designed specifically for the energy and chaos of modern Indian weddings (Gen-Z/Millennial, multi-day, destination).

**What it is NOT:**
* An ERP or event management software.
* A vendor marketplace.
* A traditional wedding planner tool.

## 2. Product Philosophy
The backend operates as a **"Realtime Wedding Event Engine"**. 
Every feature must either **increase emotional engagement** or **reduce visible wedding chaos**. The application prioritizes:
* High-throughput, realtime interactions.
* Fast deployment and rapid iteration.
* Clean, modular architecture.
* Emotional and social feedback loops.

## 3. Key Differentiators & Features
* **Live Wedding Feed:** Instagram/Snapchat-style realtime media sharing.
* **Realtime Reactions:** Instant hearts, likes, and comments during events.
* **Big Screen Mode:** Direct WebSocket synchronization to project live interactions onto venue screens.
* **Performance Queue:** Realtime coordination of Sangeet/Dance performances.
* **Push Notifications:** Instant, centralized communication for guest arrivals and event start times.

## 4. Technical Architecture (MVP)
The backend architecture is built to be fast, responsive, and easy to deploy. We intentionally avoid over-engineering (no microservices, Kafka, CQRS, or complex RBAC).

### Tech Stack
* **Framework:** NestJS (Modular, clean REST and WebSocket support)
* **Database:** PostgreSQL (Relational stability)
* **ORM:** Prisma (Type-safe queries, clean modeling)
* **Realtime:** Socket.IO (The core engine for live interaction)
* **Auth & Push:** Firebase Admin SDK (OTP Verification & FCM)
* **Infrastructure:** Docker & Docker Compose for rapid iteration.

### Core Modules
1. **AuthModule:** Validates Firebase OTPs, manages sessions, and handles role-based access for Admin Users (Bride/Groom/Coordinators) vs. Guests.
2. **GuestModule:** Onboarding, side tracking (bride/groom), and attendance.
3. **FeedModule:** Handles media URLs, posts, threaded comments, and reactions.
4. **EventModule:** Live itinerary tracking (upcoming, live, completed) and hosts the `EventsGateway` for all WebSocket traffic.
5. **PerformanceModule:** Queuing and live status updates for stage performances.
6. **NotificationModule:** Triggers Firebase Cloud Messaging (FCM) announcements.

### Realtime Event Mapping (EventsGateway)
* `feed:new_post` & `feed:reaction`: Broadcasts to all users in the wedding room.
* `bigscreen:sync`: Dedicated stream for live projection.
* `event:announcement`: High-priority flashes for immediate guest attention.

## 5. Development Guidelines
* **Do not over-engineer:** Stick to the MVP goal of validating guest adoption and interaction.
* **Optimize for Realtime:** If an action happens at the wedding (a photo is taken, an event starts), it must reflect instantly on the clients and big screen via Socket.IO.
* **Offload Heavy Lifting:** Media should be uploaded directly to cloud storage (via Presigned URLs) rather than blocking the NestJS server.
