import { PrismaClient, GuestGroup } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.space.deleteMany();
  
  console.log('Seeding new Space...');
  const space = await prisma.space.create({
    data: {
      name: "Rahul & Priya's 5th Anniversary Celebration",
      theme: "Vintage Bollywood",
      inviteCode: "RAHUL2026",
      date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      events: {
        create: [
          {
            title: "Pre-party Mix & Mingle",
            description: "Drinks and casual networking.",
            venue: "Sunset Lounge",
            startTime: new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Main Celebration",
            description: "The big anniversary party!",
            venue: "Grand Ballroom",
            startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          }
        ]
      },
      guests: {
        create: [
          {
            name: "Vipul",
            group: GuestGroup.HOST,
            relation: "Host",
            isAdmin: true,
            user: {
              create: {
                firebaseUid: "vipul-firebase-uid-123",
                phone: "+919999999999",
              }
            }
          },
          {
            name: "Amit",
            group: GuestGroup.VIP,
            relation: "Close Friend",
            user: {
              create: {
                firebaseUid: "amit-firebase-uid-456",
                phone: "+918888888888",
              }
            }
          }
        ]
      }
    }
  });

  console.log('Successfully seeded database!');
  console.log(`Space created with ID: ${space.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
