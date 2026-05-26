import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Onboarding & Auth Flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Variables to hold state between steps in the flows
  let testUserId: string;
  let createdSpaceId: string;
  let testInviteCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    
    // Seed a test user
    const user = await prisma.user.create({
      data: {
        firebaseUid: 'test-firebase-uid-123',
        phone: '+1234567890',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.guest.deleteMany({});
    await prisma.space.deleteMany({});
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await app.close();
  });

  describe('Flow 2: Direct App Open & Create Space', () => {
    
    it('/spaces (POST) - Create a space and become HOST', async () => {
      const dto = {
        name: 'Test E2E Wedding',
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/spaces')
        .set('x-user-id', testUserId)
        .send(dto)
        .expect(201);

      expect(response.body.name).toEqual(dto.name);
      expect(response.body.inviteCode).toBeDefined();
      
      createdSpaceId = response.body.id;
      testInviteCode = response.body.inviteCode;

      // Verify the guest record was created as HOST
      const guest = await prisma.guest.findUnique({
        where: { userId_spaceId: { userId: testUserId, spaceId: createdSpaceId } }
      });
      
      expect(guest).toBeDefined();
      expect(guest!.group).toEqual('HOST');
      expect(guest!.isAdmin).toEqual(true);
    });

    it('/auth/session (GET) - Verify Dashboard has the created space', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/session')
        .set('x-firebase-uid', 'test-firebase-uid-123')
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.guests).toBeInstanceOf(Array);
      
      // Ensure our created space shows up in the user's dashboard
      const hostingSpace = response.body.user.guests.find((g: any) => g.spaceId === createdSpaceId);
      expect(hostingSpace).toBeDefined();
      expect(hostingSpace.space.name).toEqual('Test E2E Wedding');
    });

  });

  describe('Flow 1: Join via Invitation', () => {
    
    let guestUserId: string;

    beforeAll(async () => {
      // Create a second user acting as the guest
      const user2 = await prisma.user.create({
        data: {
          firebaseUid: 'guest-firebase-uid-456',
          phone: '+0987654321',
        },
      });
      guestUserId = user2.id;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { id: guestUserId } });
    });

    it('/spaces/invite/:code (GET) - Fetch space details by code', async () => {
      const response = await request(app.getHttpServer())
        .get(`/spaces/invite/${testInviteCode}`)
        .expect(200);

      expect(response.body.id).toEqual(createdSpaceId);
      expect(response.body.name).toEqual('Test E2E Wedding');
    });

    it('/auth/join-space (POST) - Complete Profile (Upsert)', async () => {
      const dto = {
        spaceId: createdSpaceId,
        name: 'Guest E2E',
        group: 'BRIDE_SIDE',
        relation: 'Friend',
        attendance: 'YES',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/join-space')
        .set('x-user-id', guestUserId)
        .send(dto)
        .expect(201);

      expect(response.body.message).toEqual('Joined space successfully');
      expect(response.body.guest.name).toEqual('Guest E2E');
      expect(response.body.guest.attendance).toEqual('YES');
      expect(response.body.guest.group).toEqual('BRIDE_SIDE');
      expect(response.body.guest.userId).toEqual(guestUserId);
    });

    it('/auth/join-space (POST) - Update Profile (Upsert check)', async () => {
      // If the guest changes their mind and updates attendance to NO
      const dto = {
        spaceId: createdSpaceId,
        name: 'Guest E2E',
        attendance: 'NO',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/join-space')
        .set('x-user-id', guestUserId)
        .send(dto)
        .expect(201);

      expect(response.body.guest.attendance).toEqual('NO');
      
      // Ensure it didn't create a second record, but rather updated the existing one
      const guestCount = await prisma.guest.count({
        where: { userId: guestUserId, spaceId: createdSpaceId }
      });
      expect(guestCount).toEqual(1);
    });

  });
});
