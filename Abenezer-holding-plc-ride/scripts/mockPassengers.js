import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomOffset() {
  // ~1km in lat/lng
  return (Math.random() - 0.5) * 0.01;
}

async function seedPassengers() {
  const baseLat = 39.7392;
  const baseLng = -104.9903;
  const baseTime = new Date('2025-07-09T08:00:00Z');
  const passengers = Array.from({ length: 20 }).map((_, i) => {
    const pickupLat = baseLat + randomOffset();
    const pickupLng = baseLng + randomOffset();
    const dropoffLat = baseLat + 0.05 + randomOffset();
    const dropoffLng = baseLng + 0.05 + randomOffset();
    // Pickup times within a 1-hour window, 3-min increments
    const earliestPickupTime = new Date(baseTime.getTime() + i * 3 * 60 * 1000);
    const latestPickupTime = new Date(
      earliestPickupTime.getTime() + 15 * 60 * 1000
    ); // 15min window
    return {
      id: `p${i + 1}`,
      name: `Passenger ${i + 1}`,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      earliestPickupTime,
      latestPickupTime,
      estimatedDurationMin: 20,
      groupSize: 1,
      status: 'UNASSIGNED',
    };
  });

  const farBaseLat = 39.9; // ~18km north
  const farBaseLng = -105.1; // ~10km west
  const farPassengers = [
    // Very early window
    {
      id: 'p21',
      name: 'Far Early Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T04:00:00Z'),
      latestPickupTime: new Date('2025-07-09T05:00:00Z'),
      estimatedDurationMin: 35,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Very late window
    {
      id: 'p22',
      name: 'Far Late Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T22:00:00Z'),
      latestPickupTime: new Date('2025-07-09T23:00:00Z'),
      estimatedDurationMin: 40,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Large time window (spans 3 hours)
    {
      id: 'p23',
      name: 'Far Wide Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T10:00:00Z'),
      latestPickupTime: new Date('2025-07-09T13:00:00Z'),
      estimatedDurationMin: 50,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Tiny window (10 min)
    {
      id: 'p24',
      name: 'Far Tiny Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T15:00:00Z'),
      latestPickupTime: new Date('2025-07-09T15:10:00Z'),
      estimatedDurationMin: 25,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Overlapping with base cluster but far
    {
      id: 'p25',
      name: 'Far Overlap Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T08:30:00Z'),
      latestPickupTime: new Date('2025-07-09T09:30:00Z'),
      estimatedDurationMin: 30,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Large group size (test capacity)
    {
      id: 'p26',
      name: 'Far Large Group Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T12:00:00Z'),
      latestPickupTime: new Date('2025-07-09T13:00:00Z'),
      estimatedDurationMin: 45,
      groupSize: 4,
      status: 'UNASSIGNED',
    },
    // Window that crosses midnight
    {
      id: 'p27',
      name: 'Far Midnight Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T23:30:00Z'),
      latestPickupTime: new Date('2025-07-10T00:30:00Z'),
      estimatedDurationMin: 38,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Window with big gap from others
    {
      id: 'p28',
      name: 'Far Isolated Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T18:00:00Z'),
      latestPickupTime: new Date('2025-07-09T19:00:00Z'),
      estimatedDurationMin: 33,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Window that overlaps with a base cluster time but is far
    {
      id: 'p29',
      name: 'Far Cluster Overlap Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T08:10:00Z'),
      latestPickupTime: new Date('2025-07-09T08:25:00Z'),
      estimatedDurationMin: 27,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
    // Window with huge duration (test edge case)
    {
      id: 'p30',
      name: 'Far Huge Window Passenger',
      pickupLat: farBaseLat + randomOffset(),
      pickupLng: farBaseLng + randomOffset(),
      dropoffLat: farBaseLat + 0.05 + randomOffset(),
      dropoffLng: farBaseLng + 0.05 + randomOffset(),
      earliestPickupTime: new Date('2025-07-09T06:00:00Z'),
      latestPickupTime: new Date('2025-07-09T18:00:00Z'),
      estimatedDurationMin: 60,
      groupSize: 1,
      status: 'UNASSIGNED',
    },
  ];

  for (const p of passengers) {
    await prisma.passenger.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  for (const p of farPassengers) {
    await prisma.passenger.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  console.log('Mock passengers seeded!');
  process.exit(0);
}

seedPassengers();
