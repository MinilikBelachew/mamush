const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUnassigned() {
  try {
    const unassigned = await prisma.passenger.findMany({
      where: { status: 'UNASSIGNED' },
      select: {
        id: true,
        status: true,
        earliestPickupTime: true,
        latestPickupTime: true,
        pickupLat: true,
        pickupLng: true,
        estimatedDurationMin: true,
      },
    });

    console.log('Unassigned passengers:', unassigned.length);
    unassigned.forEach((p) => {
      console.log(
        `- ${p.id}: ${p.earliestPickupTime} to ${p.latestPickupTime}, duration: ${p.estimatedDurationMin}min`
      );
    });

    const assigned = await prisma.passenger.findMany({
      where: { status: 'ASSIGNED' },
      select: { id: true },
    });

    console.log('\nAssigned passengers:', assigned.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnassigned();
