import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomOffset() {
  // ~1km in lat/lng
  return (Math.random() - 0.5) * 0.01;
}

async function seedDrivers() {
  const baseLat = 39.7392;
  const baseLng = -104.9903;
  const availabilityStart = new Date('2025-07-09T08:00:00Z');
  const availabilityEnd = new Date('2025-07-20T18:00:00Z');
  const drivers = Array.from({ length: 10 }).map((_, i) => {
    const currentLat = baseLat + randomOffset();
    const currentLng = baseLng + randomOffset();
    return {
      id: `d${i + 1}`,
      name: `Driver ${i + 1}`,
      currentLat,
      currentLng,
      status: 'IDLE',
      capacity: 4,
      availabilityStart,
      availabilityEnd,
    };
  });

  for (const d of drivers) {
    await prisma.driver.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }
  console.log('Mock drivers seeded!');
  process.exit(0);
}

seedDrivers();
