import {
  Driver,
  Passenger,
  Assignment,
  PassengerStatus,
  DriverStatus,
  AssignmentStatus,
} from '@prisma/client';
import { prisma } from '@utils/prisma';
import { GoogleMapsService } from './googleMap';
import { MockGoogleMapsService } from './googleMap.mock';
import {
  validateAdvancedAssignments,
  printAdvancedReport,
} from '../validator/assignmentValidator';

interface PotentialGroup {
  passengers: Passenger[];
  distance: number;
  timeGap: number;
  directionScore: number;
  combinedCapacity: number;
  timeWindow: { start: Date; end: Date };
}

export interface CarpoolGroup {
  groupId: string;
  passengers: Passenger[];
  pickupDistance: number;
  timeGap: number;
  directionScore: number;
  combinedWindow: { start: Date; end: Date };
}

// Helper: Map pickup times to target date
function mapPickupTimesToTargetDate(
  passengerEarliestTime: Date,
  passengerLatestTime: Date,
  targetDate: Date
): { earliestPickup: Date; latestPickup: Date } {
  const earliestPickup = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      passengerEarliestTime.getUTCHours(),
      passengerEarliestTime.getUTCMinutes(),
      passengerEarliestTime.getUTCSeconds(),
      passengerEarliestTime.getUTCMilliseconds()
    )
  );
  const latestPickup = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      passengerLatestTime.getUTCHours(),
      passengerLatestTime.getUTCMinutes(),
      passengerLatestTime.getUTCSeconds(),
      passengerLatestTime.getUTCMilliseconds()
    )
  );
  if (latestPickup.getTime() < earliestPickup.getTime()) {
    latestPickup.setUTCDate(latestPickup.getUTCDate() + 1);
  }
  return { earliestPickup, latestPickup };
}

// Helper: Assign best match (transactional)
async function assignBestMatch(match: {
  passenger: Passenger;
  driver: Driver;
  estimatedPickupTime: Date;
  passengerRideDurationSeconds: number;
}): Promise<Assignment | null> {
  const {
    passenger,
    driver,
    estimatedPickupTime,
    passengerRideDurationSeconds,
  } = match;
  const estimatedDropoffTime = new Date(
    estimatedPickupTime.getTime() + passengerRideDurationSeconds * 1000
  );
  let newAssignmentResult: Assignment | null = null;
  try {
    newAssignmentResult = await prisma.$transaction(async (tx) => {
      const updatedPassengerCount = await tx.passenger.updateMany({
        where: {
          id: passenger.id,
          status: PassengerStatus.UNASSIGNED,
        },
        data: {
          status: PassengerStatus.ASSIGNED,
          assignedDriverId: driver.id,
        },
      });
      if (updatedPassengerCount.count === 0) {
        console.log(
          `[RACE_CONDITION] Passenger ${passenger.id} was already assigned by another process. Aborting transaction.`
        );
        throw new Error('Passenger not available');
      }
      const updatedDriverCount = await tx.driver.updateMany({
        where: {
          id: driver.id,
          status: DriverStatus.IDLE,
        },
        data: {
          status: DriverStatus.EN_ROUTE_TO_PICKUP,
        },
      });
      if (updatedDriverCount.count === 0) {
        console.log(
          `[RACE_CONDITION] Driver ${driver.id} was already assigned by another process. Aborting transaction.`
        );
        throw new Error('Driver not available');
      }
      const newAssignment = await tx.assignment.create({
        data: {
          driverId: driver.id,
          passengerId: passenger.id,
          estimatedPickupTime,
          estimatedDropoffTime,
          status: AssignmentStatus.CONFIRMED,
        },
      });
      await tx.driver.update({
        where: { id: driver.id },
        data: {
          currentAssignmentId: newAssignment.id,
          nextLat: passenger.dropoffLat ?? driver.currentLat,
          nextLng: passenger.dropoffLng ?? driver.currentLng,
          availableAt: estimatedDropoffTime,
        },
      });
      return newAssignment;
    });
  } catch (error: any) {
    if (
      error.message !== 'Passenger not available' &&
      error.message !== 'Driver not available'
    ) {
      console.error(
        `Transaction failed for P-${passenger.id} & D-${driver.id}:`,
        error
      );
    }
    return null;
  }
  // Carpool enhancement logic would go here if needed
  return newAssignmentResult;
}

// // Helper: Calculate direction compatibility
// function calculateDirectionCompatibility(p1: Passenger, p2: Passenger): number {
//   // Calculate vectors for both passengers' trips
//   const p1Vector = {
//     lat: p1.dropoffLat - p1.pickupLat,
//     lng: p1.dropoffLng - p1.pickupLng,
//   };
//   const p2Vector = {
//     lat: p2.dropoffLat - p2.pickupLat,
//     lng: p2.dropoffLng - p2.pickupLng,
//   };
//   // Calculate magnitudes
//   const p1Magnitude = Math.sqrt(
//     p1Vector.lat * p1Vector.lat + p1Vector.lng * p1Vector.lng
//   );
//   const p2Magnitude = Math.sqrt(
//     p2Vector.lat * p2Vector.lat + p2Vector.lng * p2Vector.lng
//   );
//   if (p1Magnitude === 0 || p2Magnitude === 0) {
//     return 0;
//   }
//   // Calculate dot product
//   const dotProduct = p1Vector.lat * p2Vector.lat + p1Vector.lng * p2Vector.lng;
//   // Calculate cosine similarity (angle between vectors)
//   const cosineSimilarity = dotProduct / (p1Magnitude * p2Magnitude);
//   // Convert to a 0-1 score where 1 means same direction, 0 means opposite directions
//   const directionScore = (cosineSimilarity + 1) / 2;
//   // Additional penalty for very different trip lengths
//   const lengthRatio =
//     Math.min(p1Magnitude, p2Magnitude) / Math.max(p1Magnitude, p2Magnitude);
//   const lengthPenalty = lengthRatio * 0.2;
//   // Final score combines direction alignment and length similarity
//   const finalScore = directionScore * 0.8 + lengthPenalty;
//   return Math.max(0, Math.min(1, finalScore));
// }

// Helper: Calculate distance (Haversine)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}



// function detectCarpoolOpportunities(passengers: Passenger[]): Array<{
//   primaryPassenger: Passenger;
//   secondaryPassenger: Passenger;
//   distance: number;
//   timeGap: number;
//   directionScore: number;
//   groupId: string;
// }> {
//   const initialGroups: Array<any> = [];

//   for (let i = 0; i < passengers.length; i++) {
//     for (let j = i + 1; j < passengers.length; j++) {
//       const primaryPassenger = passengers[i];
//       const secondaryPassenger = passengers[j];

//       // === Null/undefined field checks ===
//       if (
//         !primaryPassenger.pickupLat ||
//         !primaryPassenger.pickupLng ||
//         !primaryPassenger.dropoffLat ||
//         !primaryPassenger.dropoffLng ||
//         !primaryPassenger.earliestPickupTime ||
//         !secondaryPassenger.pickupLat ||
//         !secondaryPassenger.pickupLng ||
//         !secondaryPassenger.dropoffLat ||
//         !secondaryPassenger.dropoffLng ||
//         !secondaryPassenger.earliestPickupTime
//       )
//         continue;

//       // === Distance filter ===
//       const pickupDistance = getDistanceInKm(
//         primaryPassenger.pickupLat,
//         primaryPassenger.pickupLng,
//         secondaryPassenger.pickupLat,
//         secondaryPassenger.pickupLng
//       );
//       if (pickupDistance > 1) continue;

//       // === Time gap filter ===
//       const timeGap =
//         Math.abs(
//           new Date(primaryPassenger.earliestPickupTime).getTime() -
//             new Date(secondaryPassenger.earliestPickupTime).getTime()
//         ) / 60000;
//       if (timeGap > 10) continue;

//       // === Direction score filter ===
//       const directionScore = computeDirectionScore(
//         primaryPassenger,
//         secondaryPassenger
//       );
//       if (directionScore < 0.6) continue;

//       // === Create and tag group ===
//       const groupId = `CARPOOL_${primaryPassenger.id}_${secondaryPassenger.id}`;
//       initialGroups.push({
//         primaryPassenger: { ...primaryPassenger, carpoolGroupId: groupId },
//         secondaryPassenger: { ...secondaryPassenger, carpoolGroupId: groupId },
//         distance: pickupDistance,
//         timeGap,
//         directionScore,
//         groupId,
//       });
//     }
//   }

//   // === Filter to prevent overlapping assignments ===
//   const usedPassengerIds = new Set<string>();
//   const finalGroups = [];

//   for (const group of initialGroups) {
//     const { primaryPassenger, secondaryPassenger } = group;
//     if (
//       !usedPassengerIds.has(primaryPassenger.id) &&
//       !usedPassengerIds.has(secondaryPassenger.id)
//     ) {
//       finalGroups.push(group);
//       usedPassengerIds.add(primaryPassenger.id);
//       usedPassengerIds.add(secondaryPassenger.id);
//     }
//   }

//   return finalGroups;
// }

 function detectCarpoolOpportunities(passengers: Passenger[]): CarpoolGroup[] {
  const potentialGroups: PotentialGroup[] = [];

  // First pass: find all possible pairs meeting basic criteria
  for (let i = 0; i < passengers.length; i++) {
    for (let j = i + 1; j < passengers.length; j++) {
      const p1 = passengers[i];
      const p2 = passengers[j];

      if (!validatePassengersHaveRequiredFields(p1, p2)) continue;

      const distance = calculatePickupDistance(p1, p2);
      if (distance > 1) continue; // 1km threshold

      const timeCompatibility = checkTimeCompatibility(p1, p2);
      if (!timeCompatibility.compatible) continue;

      const directionScore = calculateDirectionCompatibility(p1, p2);
      if (directionScore < 0.6) continue;

      potentialGroups.push({
        passengers: [p1, p2],
        distance,
        timeGap: timeCompatibility.timeGap,
        directionScore,
        combinedCapacity: (p1.groupSize || 1) + (p2.groupSize || 1),
        timeWindow: timeCompatibility.combinedWindow
      });
    }
  }

  // Second pass: optimize groupings to prevent overlaps
  return optimizeCarpoolGroups(potentialGroups);
}

async function detectAndOptimizeCarpools(passengers: Passenger[]): Promise<CarpoolGroup[]> {
  // 1. Detect potential groups
  const potentialGroups = detectCarpoolOpportunities(passengers);

  // 2. Optimize routes for each group
  for (const group of potentialGroups) {
    try {
      group.optimizedRoute = await gms.optimizeRoute({
        origin: { lat: group.passengers[0].pickupLat, lng: group.passengers[0].pickupLng },
        waypoints: group.passengers.flatMap(p => [
          { location: { lat: p.pickupLat, lng: p.pickupLng }, stopType: 'PICKUP' },
          { location: { lat: p.dropoffLat, lng: p.dropoffLng }, stopType: 'DROPOFF' }
        ]),
        departureTime: group.combinedWindow.start
      });
      
      // Calculate actual metrics after optimization
      const { distance, timeGap } = calculateOptimizedMetrics(group.optimizedRoute);
      group.pickupDistance = distance;
      group.timeGap = timeGap;
    } catch (error) {
      console.error(`Failed to optimize route for carpool group: ${error}`);
      group.optimizedRoute = null;
    }
  }

  return potentialGroups.filter(g => g.optimizedRoute !== null);
}

function calculateOptimizedMetrics(optimizedRoute: any): { distance: number; timeGap: number } {
  // Implementation depends on Google Maps API response format
  // Calculate actual distance and time gaps between pickups
  return {
    distance: optimizedRoute.routes[0].legs.reduce((sum: number, leg: any) => sum + leg.distance.value / 1000, 0), // in km
    timeGap: optimizedRoute.routes[0].legs.reduce((sum: number, leg: any) => sum + leg.duration.value / 60, 0) // in minutes
  };
}
function optimizeCarpoolGroups(potentialGroups: PotentialGroup[]): CarpoolGroup[] {
  // Sort by best matches first
  const sortedGroups = [...potentialGroups].sort((a, b) => {
    // Higher score = better match
    const scoreA = (1 - a.distance) * 0.4 + 
                  (1 - (a.timeGap / 10)) * 0.3 + 
                  a.directionScore * 0.3;
    const scoreB = (1 - b.distance) * 0.4 + 
                  (1 - (b.timeGap / 10)) * 0.3 + 
                  b.directionScore * 0.3;
    return scoreB - scoreA;
  });

  const finalGroups: CarpoolGroup[] = [];
  const assignedPassengers = new Set<string>();

  // Greedy algorithm to select non-overlapping groups
  for (const group of sortedGroups) {
    const passengerIds = group.passengers.map(p => p.id);
    
    // Check if any passengers already assigned
    if (passengerIds.some(id => assignedPassengers.has(id))) continue;
    
    // Check capacity constraints (assuming max 4)
    if (group.combinedCapacity > 4) continue;

    // Add to final groups
    finalGroups.push({
      groupId: `CARPOOL_${passengerIds.join('_')}`,
      passengers: group.passengers,
      pickupDistance: group.distance,
      timeGap: group.timeGap,
      directionScore: group.directionScore,
      combinedWindow: group.timeWindow
    });

    // Mark passengers as assigned
    passengerIds.forEach(id => assignedPassengers.add(id));
  }

  return finalGroups;
}

type PassengerRequiredField = 'pickupLat' | 'pickupLng' | 'dropoffLat' | 'dropoffLng' | 'earliestPickupTime';

function validatePassengersHaveRequiredFields(p1: Passenger, p2: Passenger): boolean {
  const requiredFields: PassengerRequiredField[] = [
    'pickupLat', 'pickupLng', 'dropoffLat', 'dropoffLng', 'earliestPickupTime'
  ];
  
  return requiredFields.every(field => 
    p1[field] !== undefined && 
    p2[field] !== undefined &&
    p1[field] !== null &&
    p2[field] !== null
  );
}

function calculatePickupDistance(p1: Passenger, p2: Passenger): number {
  return getDistanceInKm(
    p1.pickupLat,
    p1.pickupLng,
    p2.pickupLat,
    p2.pickupLng
  );
}

function checkTimeCompatibility(p1: Passenger, p2: Passenger): {
  compatible: boolean;
  timeGap: number;
  combinedWindow: { start: Date; end: Date };
} {
  const p1Start = new Date(p1.earliestPickupTime);
  const p1End = new Date(p1.latestPickupTime || p1Start.getTime() + 3600000); // Default 1hr window if missing
  
  const p2Start = new Date(p2.earliestPickupTime);
  const p2End = new Date(p2.latestPickupTime || p2Start.getTime() + 3600000);

  const timeGap = Math.abs(p1Start.getTime() - p2Start.getTime()) / 60000; // in minutes
  
  // Calculate overlapping window
  const windowStart = new Date(Math.max(p1Start.getTime(), p2Start.getTime()));
  const windowEnd = new Date(Math.min(p1End.getTime(), p2End.getTime()));
  
  const overlapMinutes = (windowEnd.getTime() - windowStart.getTime()) / 60000;
  
  return {
    compatible: overlapMinutes >= 10, // Minimum 10 minute overlap
    timeGap,
    combinedWindow: { start: windowStart, end: windowEnd }
  };
}

function calculateDirectionCompatibility(p1: Passenger, p2: Passenger): number {
  // Convert to vectors
  const p1Vector = {
    lat: p1.dropoffLat - p1.pickupLat,
    lng: p1.dropoffLng - p1.pickupLng
  };
  
  const p2Vector = {
    lat: p2.dropoffLat - p2.pickupLat,
    lng: p2.dropoffLng - p2.pickupLng
  };

  // Calculate magnitudes
  const p1Magnitude = Math.sqrt(p1Vector.lat ** 2 + p1Vector.lng ** 2);
  const p2Magnitude = Math.sqrt(p2Vector.lat ** 2 + p2Vector.lng ** 2);

  // Skip if routes are too short
  if (p1Magnitude < 0.0001 || p2Magnitude < 0.0001) return 0;

  // Calculate cosine similarity
  const dotProduct = p1Vector.lat * p2Vector.lat + p1Vector.lng * p2Vector.lng;
  const cosineSimilarity = dotProduct / (p1Magnitude * p2Magnitude);

  // Convert to 0-1 scale where 1 is perfect alignment
  return (cosineSimilarity + 1) / 2;
}
// function computeDirectionScore(p1: Passenger, p2: Passenger): number {
//   const dx1 = p1.dropoffLat - p1.pickupLat;
//   const dy1 = p1.dropoffLng - p1.pickupLng;

//   const dx2 = p2.dropoffLat - p2.pickupLat;
//   const dy2 = p2.dropoffLng - p2.pickupLng;

//   // Compute magnitudes (lengths) of direction vectors
//   const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
//   const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

//   // Skip short or zero-length movements (e.g. pickup ~ dropoff)
//   const MIN_VECTOR_LENGTH = 0.0001; // ~10 meters depending on lat/lng scale
//   if (magnitude1 < MIN_VECTOR_LENGTH || magnitude2 < MIN_VECTOR_LENGTH)
//     return 0;

//   // Compute cosine similarity of vectors
//   const dotProduct = dx1 * dx2 + dy1 * dy2;
//   const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);

//   // Clamp to [0, 1] range — 1: same direction, 0: opposite or invalid
//   return Math.max(0, cosineSimilarity);
// }

// async function optimizeCarpoolRoute(driver: Driver, group: CarpoolGroup) {
//   const waypoints = group.passengers.flatMap(p => ([
//     { location: { lat: p.pickupLat, lng: p.pickupLng }, stopType: 'PICKUP' },
//     { location: { lat: p.dropoffLat, lng: p.dropoffLng }, stopType: 'DROPOFF' }
//   ]));

//   return await GoogleMapsService.optimizeRoute({
//     origin: driver.location,
//     waypoints,
//     departureTime: group.combinedWindow.start
//   });
// }
// export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371; // Earth radius in km
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon2 - lon1);
//   const a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// function deg2rad(deg: number): number {
//   return deg * (Math.PI/180);
// }

function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

// --- Google Maps Service Selection ---
const gms =
  process.env.USE_MOCK_MAPS === 'true'
    ? new MockGoogleMapsService()
    : new GoogleMapsService();

// --- Commit assignments to DB in a transaction ---
async function commitScheduleToDatabase(
  plannedAssignments: any[]
): Promise<Assignment[]> {
  // This is a simplified version. You may want to batch or optimize this for your schema.
  return await prisma.$transaction(async (tx) => {
    const created: Assignment[] = [];
    
    for (const a of plannedAssignments) {
        if (a.passengerId.startsWith('CARPOOL_')) {
        console.warn(`[SKIP DB] Skipping virtual carpool passenger: ${a.passengerId}`);
        continue;
      }
      const assignment = await tx.assignment.create({
        data: {
          driverId: a.driverId,
          passengerId: a.passengerId,
          estimatedPickupTime: a.estimatedPickupTime,
          estimatedDropoffTime: a.estimatedDropoffTime,
          status: a.status || 'CONFIRMED',
        },
      });
      created.push(assignment);
      // Optionally update driver/passenger status here
    }
    return created;
  });
}

function averageLat(coords: number[]): number {
  return coords.reduce((sum, lat) => sum + lat, 0) / coords.length;
}

function averageLng(coords: number[]): number {
  return coords.reduce((sum, lng) => sum + lng, 0) / coords.length;
}


interface DriverState {
  driver: Driver;
  nextAvailableTime: Date;
  nextAvailableLat: number;
  nextAvailableLng: number;
  schedule: any[];
  capacityLeft?: number;
}

async function optimizeAssignmentsGlobally(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<Assignment[]> {
  // Build cost matrix with all viable pairs
  const { costMatrix, viablePairs } = await buildCostMatrix(drivers, passengers);
  
  // Run Hungarian algorithm
  const optimalAssignments = hungarianAlgorithm(costMatrix);
  
  // Process results
  const { successfulAssignments } = processAssignments(
    optimalAssignments,
    viablePairs,
    drivers,
    passengers
  );

  return successfulAssignments;
}

// Main assignment cycle (functional)
async function runAssignmentCycle(cycleDate?: Date): Promise<void> {
  console.log(
    `[DEBUG] runAssignmentCycle called with cycleDate: ${cycleDate?.toISOString() || 'undefined'}`
  );
  const targetDate = cycleDate || new Date();
  console.log(`[DEBUG] Final targetDate: ${targetDate.toISOString()}`);
  console.log(
    `[PLANNER] Starting assignment cycle for ${targetDate.toISOString()}`
  );

  // =================================================================
  // --- PHASE 1: Get All Data in One Batch ---
  // =================================================================
  console.log('[PLANNER] Phase 1: Gathering all driver and passenger data...');
  // NOTE: Replace with your own driver/passenger service if needed
  const [activeDrivers, unassignedPassengers] = await Promise.all([
    prisma.driver.findMany({ where: { status: 'IDLE' } }),
    prisma.passenger.findMany({ where: { status: 'UNASSIGNED' } }),
  ]);
  if (activeDrivers.length === 0) {
    console.log('[PLANNER] No active drivers available.');
    return;
  }
  if (unassignedPassengers.length === 0) {
    console.log('[PLANNER] No unassigned passengers available.');
    return;
  }
  console.log(
    `[PLANNER] Found ${activeDrivers.length} active drivers and ${unassignedPassengers.length} unassigned passengers.`
  );

  // =================================================================
  // --- PHASE 1.5: PRE-ASSIGNMENT CARPOOL DETECTION ---
  // =================================================================
   console.log('Detecting carpool opportunities...');
  const carpoolGroups = detectCarpoolOpportunities(unassignedPassengers);
  
  // Create virtual passengers for carpool groups
  const carpoolVirtualPassengers = carpoolGroups.map(group => ({
    ...group.passengers[0], 
    id: group.groupId,
    isCarpool: true,
    originalPassengers: group.passengers,
    groupSize: group.passengers.reduce((sum, p) => sum + (p.groupSize || 1), 0),
    earliestPickupTime: group.combinedWindow.start,
    latestPickupTime: group.combinedWindow.end,
    pickupLat: averageLat(group.passengers.map(p => p.pickupLat)),
    pickupLng: averageLng(group.passengers.map(p => p.pickupLng)),
    // Use first passenger's dropoff as initial target
    dropoffLat: group.passengers[0].dropoffLat,
    dropoffLng: group.passengers[0].dropoffLng,
    carpoolMeta: {
      distance: group.pickupDistance,
      timeGap: group.timeGap,
      directionScore: group.directionScore
    }
  }));

  // Mark original passengers as carpool members
  const carpooledPassengerIds = new Set(
    carpoolGroups.flatMap(g => g.passengers.map(p => p.id))
  );

  // Prepare all passengers for assignment
  const remainingPassengers = unassignedPassengers.filter(
    p => !carpooledPassengerIds.has(p.id)
  );
  
  const allPassengersForAssignment = [
    ...carpoolVirtualPassengers,
    ...remainingPassengers
  ];

  console.log(
    `Carpool groups: ${carpoolGroups.length} ` +
    `(affecting ${carpooledPassengerIds.size} passengers), ` +
    `Remaining individual passengers: ${remainingPassengers.length}`
  );

  // =================================================================
  // --- PHASE 2: Build Driver States (production-ready) ---
  // =================================================================
  const driversState = await Promise.all(
    activeDrivers.map(async (driver) => {
      // Get driver with full details including assignments and trips
      const driverWithDetails = await prisma.driver.findUnique({
        where: { id: driver.id },
        include: {
          assignments: {
            include: { passenger: true },
            orderBy: { estimatedPickupTime: 'desc' },
            take: 1,
          },
          trips: {
            include: { assignments: { include: { passenger: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
      if (!driverWithDetails) return null;
      let nextAvailableTime = new Date(targetDate);
      let nextAvailableLat = driverWithDetails.currentLat || 0;
      let nextAvailableLng = driverWithDetails.currentLng || 0;
      const currentAssignment = driverWithDetails.assignments[0];
      if (currentAssignment?.estimatedDropoffTime) {
        if (currentAssignment.estimatedDropoffTime > nextAvailableTime) {
          nextAvailableTime = new Date(currentAssignment.estimatedDropoffTime);
          nextAvailableLat =
            currentAssignment.passenger?.dropoffLat || nextAvailableLat;
          nextAvailableLng =
            currentAssignment.passenger?.dropoffLng || nextAvailableLng;
        }
      }
      const lastTrip = driverWithDetails.trips[0];
      if (
        lastTrip?.assignments?.[lastTrip.assignments.length - 1]
          ?.estimatedDropoffTime
      ) {
        const tripDropoff =
          lastTrip.assignments[lastTrip.assignments.length - 1]
            .estimatedDropoffTime;
        if (tripDropoff && tripDropoff > nextAvailableTime) {
          nextAvailableTime = new Date(tripDropoff);
          const lastTripAssignment =
            lastTrip.assignments[lastTrip.assignments.length - 1];
          nextAvailableLat =
            lastTripAssignment.passenger?.dropoffLat || nextAvailableLat;
          nextAvailableLng =
            lastTripAssignment.passenger?.dropoffLng || nextAvailableLng;
        }
      }
      if (!nextAvailableTime) nextAvailableTime = new Date(targetDate);
      return {
        driver,
        nextAvailableTime,
        nextAvailableLat,
        nextAvailableLng,
        schedule: [],
      };
    })
  );
  const validDriversState = driversState.filter((ds) => ds !== null);

  // =================================================================
  // --- PHASE 3: Main Assignment Phase (production-ready, real travel time) ---
  // =================================================================
  const assignmentsFromSchedule: any[] = [];
  const assignedPassengerIds = new Set<string>();
  // Sort passengers by earliest pickup time
  const passengersSorted = allPassengersForAssignment.slice().sort((a, b) => {
    let aTime: number = 0;
    if (a.earliestPickupTime instanceof Date) {
      aTime = a.earliestPickupTime.getTime();
    } else if (
      typeof a.earliestPickupTime === 'string' ||
      typeof a.earliestPickupTime === 'number'
    ) {
      aTime = new Date(a.earliestPickupTime).getTime();
    }
    let bTime: number = 0;
    if (b.earliestPickupTime instanceof Date) {
      bTime = b.earliestPickupTime.getTime();
    } else if (
      typeof b.earliestPickupTime === 'string' ||
      typeof b.earliestPickupTime === 'number'
    ) {
      bTime = new Date(b.earliestPickupTime).getTime();
    }
    return aTime - bTime;
  });
  // Track driver schedules
  const driverSchedules: Array<{
    driver: any;
    schedule: Array<{
      passengerId: string;
      estimatedPickupTime: Date;
      estimatedDropoffTime: Date;
      travelTimeToPickupSeconds: number;
      carpoolGroup?: any;
      pickupLat: number;
      pickupLng: number;
      dropoffLat: number;
      dropoffLng: number;
    }>;
    nextAvailableTime: Date;
    nextAvailableLat: number;
    nextAvailableLng: number;
    capacityLeft: number;
  }> = validDriversState.map((ds) => ({
    driver: ds.driver,
    schedule: [],
    nextAvailableTime: ds.nextAvailableTime,
    nextAvailableLat: ds.nextAvailableLat,
    nextAvailableLng: ds.nextAvailableLng,
    capacityLeft: ds.driver.capacity || 4,
  }));

  for (const passenger of passengersSorted) {
    if (assignedPassengerIds.has(passenger.id)) continue;
    if (!passenger.earliestPickupTime || !passenger.latestPickupTime) continue;
    let effectiveEarliest = passenger.earliestPickupTime;
    let effectiveLatest = passenger.latestPickupTime;
    if (
      (passenger as any).carpoolOverlapEarliest &&
      (passenger as any).carpoolOverlapLatest
    ) {
      effectiveEarliest = (passenger as any).carpoolOverlapEarliest;
      effectiveLatest = (passenger as any).carpoolOverlapLatest;
      console.log(
        `[ASSIGN_CARPOOL] Carpool ${passenger.id}: Using overlap window ${effectiveEarliest.toISOString()} to ${effectiveLatest.toISOString()}`
      );
    }
    let bestDriverIdx: number | null = null;
    let bestIdleGap: number = Infinity;
    let bestPickupTime: Date | null = null;
    let bestDropoffTime: Date | null = null;
    let bestTravelTimeToPickupSeconds: number = 0;
    const bestPickupLat = passenger.pickupLat;
    const bestPickupLng = passenger.pickupLng;
    const bestDropoffLat = passenger.dropoffLat;
    const bestDropoffLng = passenger.dropoffLng;
    const bestCarpoolGroup = (passenger as any)?.carpoolGroup;
    for (let d = 0; d < driverSchedules.length; d++) {
      const ds = driverSchedules[d];
      if (ds.capacityLeft <= 0) continue;
      const prevDropoffTime = ds.nextAvailableTime;
      const prevDropoffLat = ds.nextAvailableLat;
      const prevDropoffLng = ds.nextAvailableLng;
      // Simulate travel time (replace with real API call if needed)
      const travelTimeToPickupSeconds = await gms.getTravelTimeInSeconds({
        origin: { lat: prevDropoffLat, lng: prevDropoffLng },
        destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
        departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
      });
      if (travelTimeToPickupSeconds === null) continue;
      const arrivalAtPickup = new Date(
        prevDropoffTime.getTime() + travelTimeToPickupSeconds * 1000
      );
      const passengerEarliestPickup = new Date(effectiveEarliest);
      const passengerLatestPickup = new Date(effectiveLatest);
      if (arrivalAtPickup > passengerLatestPickup) continue;
      const mustLeaveBy = new Date(
        passengerEarliestPickup.getTime() - travelTimeToPickupSeconds * 1000
      );
      const idleGapMinutes =
        (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
      if (idleGapMinutes > 30 || idleGapMinutes < 0) continue;
      const estimatedPickupTime = new Date(
        Math.max(arrivalAtPickup.getTime(), passengerEarliestPickup.getTime())
      );
      const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
      const estimatedDropoffTime = new Date(
        estimatedPickupTime.getTime() + rideDurationSeconds * 1000
      );
      if (
        idleGapMinutes < bestIdleGap ||
        (idleGapMinutes === bestIdleGap &&
          estimatedPickupTime < (bestPickupTime || estimatedPickupTime))
      ) {
        bestDriverIdx = d;
        bestIdleGap = idleGapMinutes;
        bestPickupTime = estimatedPickupTime;
        bestDropoffTime = estimatedDropoffTime;
        bestTravelTimeToPickupSeconds = travelTimeToPickupSeconds;
      }
    }
    if (bestDriverIdx !== null) {
      const ds = driverSchedules[bestDriverIdx];
      ds.schedule.push({
        passengerId: passenger.id,
        estimatedPickupTime: bestPickupTime!,
        estimatedDropoffTime: bestDropoffTime!,
        travelTimeToPickupSeconds: bestTravelTimeToPickupSeconds,
        carpoolGroup: bestCarpoolGroup,
        pickupLat: bestPickupLat,
        pickupLng: bestPickupLng,
        dropoffLat: bestDropoffLat,
        dropoffLng: bestDropoffLng,
      });
      ds.nextAvailableTime = bestDropoffTime!;
      ds.nextAvailableLat = bestDropoffLat;
      ds.nextAvailableLng = bestDropoffLng;
      ds.capacityLeft -= passenger.groupSize || 1;
      assignmentsFromSchedule.push({
        driverId: ds.driver.id,
        passengerId: passenger.id,
        estimatedPickupTime: bestPickupTime!,
        estimatedDropoffTime: bestDropoffTime!,
        status: 'PENDING',
        carpoolGroup: bestCarpoolGroup,
        travelTimeToPickupSeconds: bestTravelTimeToPickupSeconds,
        originLat: ds.nextAvailableLat ?? 0,
        originLng: ds.nextAvailableLng ?? 0,
        originTime: ds.nextAvailableTime ?? new Date(),
      });
      assignedPassengerIds.add(passenger.id);
      continue;
    }
    // No eligible driver found for chaining, try to start a new driver
    const unusedDriverIdx = driverSchedules.findIndex(
      (ds) => ds.schedule.length === 0
    );
    if (unusedDriverIdx === -1) continue;
    const ds = driverSchedules[unusedDriverIdx];
    const travelTimeToPickupSeconds = await gms.getTravelTimeInSeconds({
      origin: { lat: ds.nextAvailableLat, lng: ds.nextAvailableLng },
      destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
      departure_time: Math.floor(ds.nextAvailableTime.getTime() / 1000),
    });
    if (travelTimeToPickupSeconds === null) continue;
    const arrivalAtPickup = new Date(
      ds.nextAvailableTime.getTime() + travelTimeToPickupSeconds * 1000
    );
    const passengerEarliestPickup = new Date(effectiveEarliest);
    const passengerLatestPickup = new Date(effectiveLatest);
    if (arrivalAtPickup > passengerLatestPickup) continue;
    const estimatedPickupTime = new Date(
      Math.max(arrivalAtPickup.getTime(), passengerEarliestPickup.getTime())
    );
    const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
    const estimatedDropoffTime = new Date(
      estimatedPickupTime.getTime() + rideDurationSeconds * 1000
    );
    ds.schedule.push({
      passengerId: passenger.id,
      estimatedPickupTime,
      estimatedDropoffTime,
      travelTimeToPickupSeconds,
      carpoolGroup: bestCarpoolGroup,
      pickupLat: bestPickupLat,
      pickupLng: bestPickupLng,
      dropoffLat: bestDropoffLat,
      dropoffLng: bestDropoffLng,
    });
    ds.nextAvailableTime = estimatedDropoffTime;
    ds.nextAvailableLat = bestDropoffLat;
    ds.nextAvailableLng = bestDropoffLng;
    ds.capacityLeft -= passenger.groupSize || 1;
    assignmentsFromSchedule.push({
      driverId: ds.driver.id,
      passengerId: passenger.id,
      estimatedPickupTime,
      estimatedDropoffTime,
      status: 'PENDING',
      carpoolGroup: bestCarpoolGroup,
      travelTimeToPickupSeconds,
      originLat: ds.nextAvailableLat ?? 0,
      originLng: ds.nextAvailableLng ?? 0,
      originTime: ds.nextAvailableTime ?? new Date(),
    });
    assignedPassengerIds.add(passenger.id);
  }

  // =================================================================
  // --- PHASE 4: Fallback Assignment for Unassigned Passengers ---
  // =================================================================
  // Simulate getting still unassigned passengers (in real code, query DB)
  const stillUnassigned = allPassengersForAssignment.filter(
    (p) => !assignedPassengerIds.has(p.id)
  );
  if (stillUnassigned.length > 0) {
    console.log(
      `[FALLBACK] Assigning ${stillUnassigned.length} unassigned passengers using fallback phase...`
    );
    const driverAssignmentCounts: Record<string, number> = {};
    for (const ds of driverSchedules) {
      driverAssignmentCounts[ds.driver.id] = ds.schedule.length;
    }
    for (const passenger of stillUnassigned) {
      let bestDriver: (typeof driverSchedules)[0] | null = null;
      let bestIdleGap: number = Infinity;
      let bestPickupTime: Date | null = null;
      let bestDropoffTime: Date | null = null;
      let bestTravelTimeToPickupSeconds: number | null = null;
      let minAssignments = Infinity;
      for (const ds of driverSchedules) {
        const prevDropoffTime = ds.nextAvailableTime;
        const prevDropoffLat = ds.nextAvailableLat;
        const prevDropoffLng = ds.nextAvailableLng;
        const travelTimeToPickupSeconds = await gms.getTravelTimeInSeconds({
          origin: { lat: prevDropoffLat, lng: prevDropoffLng },
          destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
          departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
        });
        if (travelTimeToPickupSeconds === null) continue;
        const estimatedPickupTime = new Date(
          Math.max(
            prevDropoffTime.getTime() + travelTimeToPickupSeconds * 1000,
            passenger.earliestPickupTime
              ? new Date(passenger.earliestPickupTime).getTime()
              : new Date().getTime()
          )
        );
        const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
        const estimatedDropoffTime = new Date(
          estimatedPickupTime.getTime() + rideDurationSeconds * 1000
        );
        const mustLeaveBy = new Date(
          estimatedPickupTime.getTime() - travelTimeToPickupSeconds * 1000
        );
        const idleGapMinutes =
          (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
        const assignmentCount = driverAssignmentCounts[ds.driver.id];
        if (
          assignmentCount < minAssignments ||
          (assignmentCount === minAssignments && idleGapMinutes < bestIdleGap)
        ) {
          bestDriver = ds;
          minAssignments = assignmentCount;
          bestIdleGap = idleGapMinutes;
          bestPickupTime = estimatedPickupTime;
          bestDropoffTime = estimatedDropoffTime;
          bestTravelTimeToPickupSeconds = travelTimeToPickupSeconds;
        }
      }
      let assigned = false;
      if (bestDriver) {
        bestDriver.schedule.push({
          passengerId: passenger.id,
          estimatedPickupTime: bestPickupTime!,
          estimatedDropoffTime: bestDropoffTime!,
          travelTimeToPickupSeconds: bestTravelTimeToPickupSeconds!,
          pickupLat: passenger.pickupLat,
          pickupLng: passenger.pickupLng,
          dropoffLat: passenger.dropoffLat,
          dropoffLng: passenger.dropoffLng,
        });
        bestDriver.nextAvailableTime = bestDropoffTime!;
        bestDriver.nextAvailableLat = passenger.dropoffLat;
        bestDriver.nextAvailableLng = passenger.dropoffLng;
        assignmentsFromSchedule.push({
          driverId: bestDriver.driver.id,
          passengerId: passenger.id,
          estimatedPickupTime: bestPickupTime!,
          estimatedDropoffTime: bestDropoffTime!,
          status: 'PENDING',
          travelTimeToPickupSeconds: bestTravelTimeToPickupSeconds!,
          originLat: bestDriver.nextAvailableLat ?? 0,
          originLng: bestDriver.nextAvailableLng ?? 0,
          originTime: bestDriver.nextAvailableTime ?? new Date(),
        });
        driverAssignmentCounts[bestDriver.driver.id]++;
        assigned = true;
        console.log(
          `[FALLBACK] Assigned passenger ${passenger.id} to driver ${bestDriver.driver.id} (fallback phase, idle gap: ${bestIdleGap.toFixed(1)} min, assignments: ${driverAssignmentCounts[bestDriver.driver.id]})`
        );
      }
      if (!assigned && driverSchedules.length > 0) {
        let fallbackEarliestDriver: (typeof driverSchedules)[0] | null = null;
        let fallbackEarliestTime: Date | null = null;
        for (const ds of driverSchedules) {
          if (
            !fallbackEarliestTime ||
            ds.nextAvailableTime < fallbackEarliestTime
          ) {
            fallbackEarliestTime = ds.nextAvailableTime;
            fallbackEarliestDriver = ds;
          }
        }
        if (fallbackEarliestDriver) {
          const ds = fallbackEarliestDriver;
          const prevDropoffTime = ds.nextAvailableTime;
          const prevDropoffLat = ds.nextAvailableLat;
          const prevDropoffLng = ds.nextAvailableLng;
          const travelTimeToPickupSeconds = await gms.getTravelTimeInSeconds({
            origin: { lat: prevDropoffLat, lng: prevDropoffLng },
            destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
            departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
          });
          if (travelTimeToPickupSeconds === null) continue;
          const estimatedPickupTime = new Date(
            Math.max(
              prevDropoffTime.getTime() + travelTimeToPickupSeconds * 1000,
              passenger.earliestPickupTime
                ? new Date(passenger.earliestPickupTime).getTime()
                : new Date().getTime()
            )
          );
          const rideDurationSeconds =
            (passenger.estimatedDurationMin || 20) * 60;
          const estimatedDropoffTime = new Date(
            estimatedPickupTime.getTime() + rideDurationSeconds * 1000
          );
          ds.schedule.push({
            passengerId: passenger.id,
            estimatedPickupTime,
            estimatedDropoffTime,
            travelTimeToPickupSeconds,
            pickupLat: passenger.pickupLat,
            pickupLng: passenger.pickupLng,
            dropoffLat: passenger.dropoffLat,
            dropoffLng: passenger.dropoffLng,
          });
          ds.nextAvailableTime = estimatedDropoffTime;
          ds.nextAvailableLat = passenger.dropoffLat;
          ds.nextAvailableLng = passenger.dropoffLng;
          assignmentsFromSchedule.push({
            driverId: ds.driver.id,
            passengerId: passenger.id,
            estimatedPickupTime,
            estimatedDropoffTime,
            status: 'PENDING',
            travelTimeToPickupSeconds,
            originLat: ds.nextAvailableLat ?? 0,
            originLng: ds.nextAvailableLng ?? 0,
            originTime: ds.nextAvailableTime ?? new Date(),
          });
          driverAssignmentCounts[ds.driver.id]++;
          console.log(
            `[FALLBACK] Assigned passenger ${passenger.id} to driver ${ds.driver.id} (fallback phase, idle gap > 30min, assignments: ${driverAssignmentCounts[ds.driver.id]})`
          );
        }
      }
    }
  }

  // =================================================================
  // --- PHASE 5: Commit to Database ---
  // =================================================================
  await commitScheduleToDatabase(assignmentsFromSchedule);

  // =================================================================
  // --- PHASE 6: Final Status Report ---
  // =================================================================
  const finalUnassigned = allPassengersForAssignment.filter(
    (p) => !assignedPassengerIds.has(p.id)
  );
  for (const p of finalUnassigned) {
    let reason =
      'No available driver within 30min idle gap and passenger time window.';
    if (!p.earliestPickupTime || !p.latestPickupTime) {
      reason = 'Missing pickup time data.';
    }
    console.log(`[UNASSIGNED] Passenger ${p.id} (${p.name || ''}): ${reason}`);
  }
  console.log(
    `[PLANNER] Cycle complete. ${assignmentsFromSchedule.length} passengers assigned, ${finalUnassigned.length} remain unassigned.`
  );
  const usedDrivers = assignmentsFromSchedule
    .map((a) => a.driverId)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  console.log(`[PLANNER] Total drivers used: ${usedDrivers.length}`);

  // --- NEW: Driver Idle Time Efficiency Report ---
  const driverIdleStats: Record<
    string,
    { totalIdle: number; gaps: number; maxGap: number }
  > = {};
  for (const driverId of usedDrivers) {
    const schedule = assignmentsFromSchedule
      .filter((a) => a.driverId === driverId)
      .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
    let totalIdle = 0;
    let maxGap = 0;
    let gaps = 0;
    for (let i = 1; i < schedule.length; i++) {
      const prevDropoff = schedule[i - 1].estimatedDropoffTime;
      const nextPickup = schedule[i].estimatedPickupTime;
      // Calculate travel time from previous dropoff to next pickup
      const travelTimeToPickupSeconds =
        schedule[i].travelTimeToPickupSeconds || 0;
      // The time the driver must leave previous dropoff to reach next pickup on time
      const mustLeaveBy = new Date(
        nextPickup.getTime() - travelTimeToPickupSeconds * 1000
      );
      const idleGap = (mustLeaveBy.getTime() - prevDropoff.getTime()) / 60000; // in minutes
      if (idleGap > 0) {
        totalIdle += idleGap;
        maxGap = Math.max(maxGap, idleGap);
        gaps++;
      }
    }
    driverIdleStats[driverId] = { totalIdle, gaps, maxGap };
  }
  const allGaps = Object.values(driverIdleStats).flatMap((d) =>
    d.gaps > 0 ? [d.totalIdle / d.gaps] : []
  );
  const avgIdleGap = allGaps.length
    ? allGaps.reduce((a, b) => a + b, 0) / allGaps.length
    : 0;
  const maxIdleGap = Math.max(
    ...Object.values(driverIdleStats).map((d) => d.maxGap),
    0
  );
  console.log('===== DRIVER IDLE TIME EFFICIENCY REPORT =====');
  for (const driverId of usedDrivers) {
    const { totalIdle, gaps, maxGap } = driverIdleStats[driverId];
    console.log(
      `Driver ${driverId}: Total idle time: ${totalIdle.toFixed(1)} min, Idle gaps: ${gaps}, Max gap: ${maxGap.toFixed(1)} min, Avg gap: ${gaps ? (totalIdle / gaps).toFixed(1) : '0.0'} min`
    );
  }
  console.log(
    `Overall average idle gap: ${avgIdleGap.toFixed(1)} min, Max idle gap: ${maxIdleGap.toFixed(1)} min`
  );

  // =================================================================
  // --- PHASE 7: Advanced Validation & Reporting ---
  // =================================================================
  const result = validateAdvancedAssignments(assignmentsFromSchedule);
  printAdvancedReport(result);

  // =================================================================
  // --- PHASE 8: Performance Summary Report ---
  // =================================================================
  // 1. Count assignments by phase
  let mainPhaseAssignments = 0;
  let fallbackAssignments = 0;
  let carpoolAssignments = 0;
  let chainedAssignments = 0;
  const fallbackDriverIds = new Set<string>();
  for (const a of assignmentsFromSchedule) {
    // Fallback assignments are those with status 'PENDING' and not in the first batch
    // (This is a heuristic; if you have a better marker, use it)
    if (a.status === 'PENDING' && !a.carpoolGroup) {
      fallbackAssignments++;
      fallbackDriverIds.add(a.driverId);
    } else if (a.carpoolGroup) {
      carpoolAssignments++;
    } else {
      mainPhaseAssignments++;
    }
    // Chained assignments: if travelTimeToPickupSeconds is small (e.g. < 1800s) and not fallback
    if (
      a.travelTimeToPickupSeconds &&
      a.travelTimeToPickupSeconds < 1800 &&
      !a.carpoolGroup &&
      a.status !== 'PENDING'
    ) {
      chainedAssignments++;
    }
  }
  // 2. Per-driver stats
  const driverAssignmentCounts: Record<string, number> = {};
  for (const a of assignmentsFromSchedule) {
    driverAssignmentCounts[a.driverId] =
      (driverAssignmentCounts[a.driverId] || 0) + 1;
  }
  const maxAssignments = Math.max(...Object.values(driverAssignmentCounts));
  const minAssignments = Math.min(...Object.values(driverAssignmentCounts));
  const avgAssignments = assignmentsFromSchedule.length / usedDrivers.length;
  // 3. Large idle gap offenders
  const largeIdleGapDrivers = Object.entries(driverIdleStats)
    .filter(([_, d]) => d.maxGap > 30)
    .sort((a, b) => b[1].maxGap - a[1].maxGap);
  // 4. Print summary
  console.log('===== RIDE ASSIGNMENT PERFORMANCE SUMMARY =====');
  console.log(
    `Total Passengers Assigned: ${assignmentsFromSchedule.length} / ${assignmentsFromSchedule.length + finalUnassigned.length} (${((assignmentsFromSchedule.length / (assignmentsFromSchedule.length + finalUnassigned.length)) * 100).toFixed(0)}%)`
  );
  console.log(
    `Total Drivers Used: ${usedDrivers.length} / ${validDriversState.length} (${((usedDrivers.length / validDriversState.length) * 100).toFixed(0)}%)`
  );
  console.log('Assignments by Phase:');
  console.log(`  - Main/Chaining: ${mainPhaseAssignments}`);
  console.log(`  - Carpool: ${carpoolAssignments}`);
  console.log(`  - Fallback: ${fallbackAssignments}`);
  console.log('Driver Utilization:');
  console.log(
    `  - Average assignments per driver: ${avgAssignments.toFixed(1)}`
  );
  console.log(`  - Max assignments for a driver: ${maxAssignments}`);
  console.log(`  - Min assignments for a driver: ${minAssignments}`);
  console.log('Idle Time (min):');
  for (const driverId of usedDrivers) {
    const { totalIdle } = driverIdleStats[driverId];
    console.log(`  - ${driverId}: ${totalIdle.toFixed(1)}`);
  }
  console.log(`  - Average per driver: ${avgIdleGap.toFixed(1)}`);
  console.log(`  - Max for a driver: ${maxIdleGap.toFixed(1)}`);
  console.log(`Carpool Assignments: ${carpoolAssignments}`);
  console.log(`Chained Assignments: ${chainedAssignments}`);
  console.log(`Fallback Assignments: ${fallbackAssignments}`);
  console.log(`Large Idle Gaps (>30min): ${largeIdleGapDrivers.length}`);
  if (largeIdleGapDrivers.length > 0) {
    console.log(
      `  - Worst offender: ${largeIdleGapDrivers[0][0]} (${largeIdleGapDrivers[0][1].maxGap.toFixed(1)} min)`
    );
  }
  console.log('Driver Assignment Breakdown:');
  for (const driverId of usedDrivers) {
    const rides = driverAssignmentCounts[driverId] || 0;
    const idle = driverIdleStats[driverId]?.totalIdle || 0;
    console.log(`  ${driverId}: ${rides} rides, ${idle.toFixed(1)} min idle`);
  }
  // Recommendations
  console.log('Recommendations:');
  if (largeIdleGapDrivers.length > 0) {
    console.log(
      `- Try to reduce large idle gaps for ${largeIdleGapDrivers.map(([id]) => id).join(', ')}.`
    );
  }
  if (fallbackAssignments > mainPhaseAssignments) {
    console.log(
      '- Increase carpool/chaining in main phase to reduce fallback reliance.'
    );
  }
  if (carpoolAssignments === 0) {
    console.log('- Enable or improve carpool logic for more efficiency.');
  }
  console.log('===============================================');

  // =================================================================
  // --- PHASE 9: Performance Audit (Large Idle Gaps and Missed Opportunities) ---
  // =================================================================
  for (const driverId of usedDrivers) {
    const schedule = assignmentsFromSchedule
      .filter((a) => a.driverId === driverId)
      .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
    for (let i = 1; i < schedule.length; i++) {
      const prev = schedule[i - 1];
      const next = schedule[i];
      const travelTimeToPickupSeconds = next.travelTimeToPickupSeconds || 0;
      const mustLeaveBy = new Date(
        next.estimatedPickupTime.getTime() - travelTimeToPickupSeconds * 1000
      );
      const idleGap =
        (mustLeaveBy.getTime() - prev.estimatedDropoffTime.getTime()) / 60000;
      if (idleGap > 30) {
        console.log(
          `[PERF_AUDIT] Large idle gap detected for driver ${driverId}: ${idleGap.toFixed(1)} min between dropoff of passenger ${prev.passengerId} at ${prev.estimatedDropoffTime.toISOString()} and pickup of passenger ${next.passengerId} at ${next.estimatedPickupTime.toISOString()}`
        );
        // Try to find a better driver for 'next' assignment
        let betterDriver: string | null = null;
        let betterIdleGap: number = idleGap;
        for (const otherDriverId of usedDrivers) {
          if (otherDriverId === driverId) continue;
          const otherSchedule = assignmentsFromSchedule
            .filter((a) => a.driverId === otherDriverId)
            .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
          // Find the last assignment for this driver before next.estimatedPickupTime
          let lastAssignment = null;
          for (const a of otherSchedule) {
            if (a.estimatedDropoffTime <= next.estimatedPickupTime) {
              if (
                !lastAssignment ||
                a.estimatedDropoffTime > lastAssignment.estimatedDropoffTime
              ) {
                lastAssignment = a;
              }
            }
          }
          const prevDropoffTime = lastAssignment
            ? lastAssignment.estimatedDropoffTime
            : null;
          // If this driver is free before next's pickup
          if (prevDropoffTime !== null) {
            const travelTimeToPickupSeconds =
              next.travelTimeToPickupSeconds || 0;
            const mustLeaveBy = new Date(
              next.estimatedPickupTime.getTime() -
                travelTimeToPickupSeconds * 1000
            );
            const otherIdleGap =
              (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
            if (
              otherIdleGap >= 0 &&
              otherIdleGap <= 30 &&
              otherIdleGap < betterIdleGap
            ) {
              betterDriver = otherDriverId;
              betterIdleGap = otherIdleGap;
            }
          } else {
            // If this driver has no assignments yet, use their initial available time
            // (Assume it's the start of the day)
            // You could use validDriversState[...].nextAvailableTime if needed
          }
        }
        if (betterDriver) {
          console.log(
            `[PERF_AUDIT] Better assignment possible: Passenger ${next.passengerId} could have been assigned to driver ${betterDriver} with idle gap ${betterIdleGap.toFixed(1)} min.`
          );
        }
      }
    }
  }

  // =================================================================
  // --- PHASE 10: Error Handling & Final Cleanup ---
  // =================================================================
  // All DB writes are wrapped in transactions; check update counts as in assignBestMatch.
  console.log('[PLANNER] Assignment cycle completed successfully.');
}

async function buildCostMatrix(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<{
  costMatrix: number[][];
  viablePairs: { driverIdx: number; passengerIdx: number; details: any }[];
}> {
  const viablePairs = [];
  const costMatrix = Array(drivers.length).fill().map(() => Array(passengers.length).fill(Infinity));

  for (let d = 0; d < drivers.length; d++) {
    for (let p = 0; p < passengers.length; p++) {
      const { cost, details } = await calculateAssignmentCost(drivers[d], passengers[p]);
      costMatrix[d][p] = cost;
      
      if (cost < Infinity) {
        viablePairs.push({
          driverIdx: d,
          passengerIdx: p,
          details
        });
      }
    }
  }

  return { costMatrix, viablePairs };
}
interface Assignment {
  driverIndex: number;
  passengerIndex: number;
  cost: number;
}

 function hungarianAlgorithm(costMatrix: number[][]): Assignment[] {
  // Step 0: Validate input
  if (costMatrix.length === 0 || costMatrix[0].length === 0) {
    return [];
  }

  // Step 1: Initialize variables
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const size = Math.max(rows, cols);
  
  // Pad matrix to be square
  const paddedMatrix = costMatrix.map(row => 
    [...row, ...Array(size - row.length).fill(Infinity)]
  );
  while (paddedMatrix.length < size) {
    paddedMatrix.push(Array(size).fill(Infinity));
  }

  // Step 2: Reduce matrix
  // Subtract row minima
  for (let i = 0; i < size; i++) {
    const min = Math.min(...paddedMatrix[i]);
    for (let j = 0; j < size; j++) {
      paddedMatrix[i][j] -= min;
    }
  }

  // Subtract column minima
  for (let j = 0; j < size; j++) {
    const min = Math.min(...paddedMatrix.map(row => row[j]));
    for (let i = 0; i < size; i++) {
      paddedMatrix[i][j] -= min;
    }
  }

  // Step 3: Find initial assignments
  const assignments: Assignment[] = [];
  const rowCovered = Array(size).fill(false);
  const colCovered = Array(size).fill(false);
  const zeros = findZeros(paddedMatrix);

  while (true) {
    // Step 4: Find uncovered zeros
    const uncoveredZero = findUncoveredZero(paddedMatrix, rowCovered, colCovered);
    if (!uncoveredZero) break;

    // Step 5: Prime the zero
    const primedZero = uncoveredZero;
    const starredInRow = assignments.find(a => a.driverIndex === primedZero.row);
    
    if (!starredInRow) {
      // No existing assignment in this row
      assignments.push({
        driverIndex: primedZero.row,
        passengerIndex: primedZero.col,
        cost: costMatrix[primedZero.row]?.[primedZero.col] ?? Infinity
      });
      rowCovered[primedZero.row] = true;
      colCovered[primedZero.col] = true;
    } else {
      // Existing assignment - adjust covers
      rowCovered[primedZero.row] = true;
      colCovered[starredInRow.passengerIndex] = false;
    }

    // Step 6: Find minimum uncovered value
    const minUncovered = findMinUncovered(paddedMatrix, rowCovered, colCovered);
    
    // Step 7: Adjust the matrix
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (rowCovered[i] && !colCovered[j]) {
          paddedMatrix[i][j] += minUncovered;
        } else if (!rowCovered[i] && colCovered[j]) {
          paddedMatrix[i][j] -= minUncovered;
        }
      }
    }
  }

  // Filter out padded assignments and return
  return assignments.filter(assn => 
    assn.driverIndex < rows && 
    assn.passengerIndex < cols &&
    assn.cost < Infinity
  );
}

// Helper functions
function findZeros(matrix: number[][]): {row: number; col: number}[] {
  const zeros = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === 0) {
        zeros.push({ row: i, col: j });
      }
    }
  }
  return zeros;
}

function findUncoveredZero(
  matrix: number[][], 
  rowCovered: boolean[], 
  colCovered: boolean[]
): {row: number; col: number} | null {
  for (let i = 0; i < matrix.length; i++) {
    if (rowCovered[i]) continue;
    for (let j = 0; j < matrix[0].length; j++) {
      if (colCovered[j]) continue;
      if (matrix[i][j] === 0) {
        return { row: i, col: j };
      }
    }
  }
  return null;
}

function findMinUncovered(
  matrix: number[][], 
  rowCovered: boolean[], 
  colCovered: boolean[]
): number {
  let min = Infinity;
  for (let i = 0; i < matrix.length; i++) {
    if (rowCovered[i]) continue;
    for (let j = 0; j < matrix[0].length; j++) {
      if (colCovered[j]) continue;
      if (matrix[i][j] < min) {
        min = matrix[i][j];
      }
    }
  }
  return min;
}



async function calculateAssignmentCost(
  driver: DriverState,
  passenger: Passenger,
  isCarpool: boolean = false
): Promise<{ cost: number; details: AssignmentDetails }> {
  // 1. Calculate travel time
  const travelTime = await gms.getTravelTimeInSeconds({
    origin: { lat: driver.nextAvailableLat, lng: driver.nextAvailableLng },
    destination: { lat: passenger.pickupLat!, lng: passenger.pickupLng! },
    departure_time: Math.floor(driver.nextAvailableTime.getTime() / 1000)
  });

  if (!travelTime) return { cost: Infinity, details: {} };

  // 2. Check time window
  const arrivalTime = new Date(driver.nextAvailableTime.getTime() + travelTime * 1000);
  const passengerLatest = new Date(passenger.latestPickupTime!);
  if (arrivalTime > passengerLatest) return { cost: Infinity, details: {} };

  // 3. Calculate idle time
  const passengerEarliest = new Date(passenger.earliestPickupTime!);
  const mustLeaveBy = new Date(
    Math.max(
      passengerEarliest.getTime() - travelTime * 1000,
      driver.nextAvailableTime.getTime()
    )
  );
  const idleMinutes = (mustLeaveBy.getTime() - driver.nextAvailableTime.getTime()) / (1000 * 60);

  // 4. Apply constraints with penalties
  let cost = travelTime; // Base cost is travel time in seconds
  
  // Idle time penalty (quadratic scaling)
  if (idleMinutes > 30) {
    const excessMinutes = idleMinutes - 30;
    cost += excessMinutes * excessMinutes * 10; // Heavy penalty for excess idle time
  }

  // Capacity check
  if (driver.capacityLeft < (passenger.groupSize || 1)) {
    return { cost: Infinity, details: {} };
  }

  // Carpool bonus (negative cost adjustment)
  if (isCarpool) {
    cost *= 0.8; // 20% discount for carpools
  }

  return {
    cost,
    details: {
      travelTime,
      idleMinutes,
      estimatedPickupTime: new Date(Math.max(arrivalTime.getTime(), passengerEarliest.getTime()))
    }
  };
}


function processAssignments(
  assignments: Assignment[],
  viablePairs: any[],
  drivers: DriverState[],
  passengers: Passenger[]
): {
  successfulAssignments: any[];
  unassignedPassengers: Passenger[];
} {
  const successfulAssignments = [];
  const assignedPassengerIndices = new Set<number>();

  assignments.forEach(assignment => {
    const pair = viablePairs.find(
      p => p.driverIdx === assignment.driverIndex && 
           p.passengerIdx === assignment.passengerIndex
    );

    if (pair) {
      const driver = drivers[pair.driverIdx];
      const passenger = passengers[pair.passengerIdx];

      // Apply assignment
      successfulAssignments.push({
        driverId: driver.driver.id,
        passengerId: passenger.id,
        ...pair.details
      });

      // Update driver state
      driver.capacityLeft -= passenger.groupSize || 1;
      driver.nextAvailableTime = pair.details.estimatedDropoffTime;
      driver.nextAvailableLat = passenger.dropoffLat!;
      driver.nextAvailableLng = passenger.dropoffLng!;

      assignedPassengerIndices.add(pair.passengerIdx);
    }
  });

  const unassignedPassengers = passengers.filter(
    (_, idx) => !assignedPassengerIndices.has(idx)
  );

  return { successfulAssignments, unassignedPassengers };
}

// Functional version of _parseGoogleRoute
// function parseGoogleRoute(
//   departureTime: Date,
//   driverStart: { lat: number; lng: number },
//   waypointsForAPI: {
//     id: string;
//     lat: number;
//     lng: number;
//     type: 'PICKUP' | 'DROPOFF';
//     passengerId: string;
//   }[],
//   optimizedRoute: any
// ) {
//   const stopEtas: {
//     [key: string]: {
//       estimatedPickupTime?: Date;
//       estimatedDropoffTime?: Date;
//     };
//   } = {};

//   const optimizedWaypointOrder = optimizedRoute?.waypoint_order ?? [];
//   const optimizedWaypoints = optimizedWaypointOrder.map(
//     (i: number) => waypointsForAPI[i]
//   );

//   const lastLeg = optimizedRoute.legs[optimizedRoute.legs.length - 1];
//   const lastLat = lastLeg?.end_location?.lat ?? 0;
//   const lastLng = lastLeg?.end_location?.lng ?? 0;

//   let destinationStop = waypointsForAPI.find((wp) => {
//     return (
//       wp.type === 'DROPOFF' &&
//       Math.abs(wp.lat - lastLat) < 0.0001 &&
//       Math.abs(wp.lng - lastLng) < 0.0001
//     );
//   });

//   if (!destinationStop) {
//     const lastOptimized = optimizedWaypoints[optimizedWaypoints.length - 1];
//     if (lastOptimized.type === 'DROPOFF') {
//       destinationStop = lastOptimized;
//     }
//   }
//   if (!destinationStop) {
//     destinationStop = {
//       id: 'generated-endpoint',
//       lat: lastLeg.end_location.lat,
//       lng: lastLeg.end_location.lng,
//       type: 'DROPOFF',
//       passengerId: 'generated',
//     };
//   }
//   const finalStopOrder = [driverStart,...optimizedWaypoints, destinationStop];

//   let cumulativeSeconds = 0;

//   optimizedRoute.legs.forEach((leg: any, legIndex: number) => {

//     cumulativeSeconds += leg.duration.value;
//     const arrivalTime = new Date(
//       departureTime.getTime() + cumulativeSeconds * 1000
//     );
//     const stopInfo = finalStopOrder[legIndex + 1];

//   if (!stopInfo || !stopInfo.passengerId || stopInfo.passengerId === 'generated') return;
//     const passengerId = stopInfo.passengerId;
//     if (!stopEtas[passengerId]) stopEtas[passengerId] = {};
//     if (stopInfo.type === 'PICKUP') {
//       stopEtas[passengerId].estimatedPickupTime = arrivalTime;
//     } else if (stopInfo.type === 'DROPOFF') {
//       stopEtas[passengerId].estimatedDropoffTime = arrivalTime;
//     }
//   });
//   for (const passengerId in stopEtas) {
//     const times = stopEtas[passengerId];
//     const pickup = times.estimatedPickupTime;
//     const dropoff = times.estimatedDropoffTime;

//     if (pickup && dropoff) {
//       if (dropoff.getTime() <= pickup.getTime()) {
//         console.error(
//           `[ROUTE_PARSE_ERROR] Invalid times for passenger ${passengerId}: pickup ${pickup.toISOString()}, dropoff ${dropoff.toISOString()}`
//         );
//         // Fallback: add 2 minutes to pickup time
//         times.estimatedDropoffTime = new Date(pickup.getTime() + 2 * 60 * 1000);
//       }
//     }
//   }

//   // Return final route order (excluding driverStart) and ETA mapping
//   return {
//     finalStopOrder: finalStopOrder.slice(1), // remove driverStart from the array
//     stopEtas,
//   };

// }
function parseGoogleRoute(
  departureTime: Date,
  driverStart: { lat: number; lng: number },
  waypointsForAPI: {
    id: string;
    lat: number;
    lng: number;
    type: 'PICKUP' | 'DROPOFF';
    passengerId: string;
  }[],
  optimizedRoute: any
) {
  const stopEtas: {
    [key: string]: {
      estimatedPickupTime?: Date;
      estimatedDropoffTime?: Date;
      sequenceError?: string;
    };
  } = {};

  const optimizedWaypointOrder = optimizedRoute?.waypoint_order ?? [];
  const optimizedWaypoints = optimizedWaypointOrder.map(
    (i: number) => waypointsForAPI[i]
  );

  const lastLeg = optimizedRoute.legs[optimizedRoute.legs.length - 1];
  const lastLat = lastLeg?.end_location?.lat ?? 0;
  const lastLng = lastLeg?.end_location?.lng ?? 0;

  let destinationStop = waypointsForAPI.find((wp) => {
    return (
      wp.type === 'DROPOFF' &&
      Math.abs(wp.lat - lastLat) < 0.0001 &&
      Math.abs(wp.lng - lastLng) < 0.0001
    );
  });

  if (!destinationStop) {
    const lastOptimized = optimizedWaypoints[optimizedWaypoints.length - 1];
    if (lastOptimized.type === 'DROPOFF') {
      destinationStop = lastOptimized;
    }
  }

  if (!destinationStop) {
    destinationStop = {
      id: 'generated-endpoint',
      lat: lastLeg.end_location.lat,
      lng: lastLeg.end_location.lng,
      type: 'DROPOFF',
      passengerId: 'generated',
    };
  }

  const finalStopOrder = [driverStart, ...optimizedWaypoints, destinationStop];
  let cumulativeSeconds = 0;

  // First pass: calculate all ETAs
  optimizedRoute.legs.forEach((leg: any, legIndex: number) => {
    cumulativeSeconds += leg.duration.value;
    const arrivalTime = new Date(
      departureTime.getTime() + cumulativeSeconds * 1000
    );
    const stopInfo = finalStopOrder[legIndex + 1];

    if (
      !stopInfo ||
      !stopInfo.passengerId ||
      stopInfo.passengerId === 'generated'
    )
      return;

    const passengerId = stopInfo.passengerId;
    if (!stopEtas[passengerId]) stopEtas[passengerId] = {};

    if (stopInfo.type === 'PICKUP') {
      stopEtas[passengerId].estimatedPickupTime = arrivalTime;
    } else if (stopInfo.type === 'DROPOFF') {
      stopEtas[passengerId].estimatedDropoffTime = arrivalTime;
    }
  });

  // Second pass: validate sequence and timing
  const passengerSequence: Record<string, number> = {};
  finalStopOrder.forEach((stop, index) => {
    if (stop.passengerId && stop.passengerId !== 'generated') {
      passengerSequence[stop.passengerId] =
        passengerSequence[stop.passengerId] || index;
    }
  });

  for (const passengerId in stopEtas) {
    const times = stopEtas[passengerId];
    const pickup = times.estimatedPickupTime;
    const dropoff = times.estimatedDropoffTime;

    if (pickup && dropoff) {
      // Check if dropoff happens before pickup
      if (dropoff.getTime() <= pickup.getTime()) {
        const errorMsg =
          `Invalid time sequence for passenger ${passengerId}: ` +
          `dropoff (${dropoff.toISOString()}) occurs before or at same time as pickup (${pickup.toISOString()})`;

        console.error(`[ROUTE_PARSE_ERROR] ${errorMsg}`);
        times.sequenceError = errorMsg;

        // Instead of auto-correcting, we'll let the calling code handle this
        delete times.estimatedPickupTime;
        delete times.estimatedDropoffTime;
      }
    } else {
      // Check if we're missing either pickup or dropoff
      if (!pickup) {
        const errorMsg = `Missing pickup time for passenger ${passengerId}`;
        console.error(`[ROUTE_PARSE_ERROR] ${errorMsg}`);
        times.sequenceError = errorMsg;
      }
      if (!dropoff) {
        const errorMsg = `Missing dropoff time for passenger ${passengerId}`;
        console.error(`[ROUTE_PARSE_ERROR] ${errorMsg}`);
        times.sequenceError = times.sequenceError
          ? `${times.sequenceError}; ${errorMsg}`
          : errorMsg;
      }
    }

    // Check if pickup appears after dropoff in the route sequence
    const pickupIndex = finalStopOrder.findIndex(
      (s) => s.passengerId === passengerId && s.type === 'PICKUP'
    );
    const dropoffIndex = finalStopOrder.findIndex(
      (s) => s.passengerId === passengerId && s.type === 'DROPOFF'
    );

    if (
      pickupIndex !== -1 &&
      dropoffIndex !== -1 &&
      pickupIndex > dropoffIndex
    ) {
      const errorMsg =
        `Invalid route sequence for passenger ${passengerId}: ` +
        `pickup (index ${pickupIndex}) appears after dropoff (index ${dropoffIndex}) in route`;

      console.error(`[ROUTE_PARSE_ERROR] ${errorMsg}`);
      times.sequenceError = times.sequenceError
        ? `${times.sequenceError}; ${errorMsg}`
        : errorMsg;
    }
  }

  // Return final route order (excluding driverStart) and ETA mapping
  return {
    finalStopOrder: finalStopOrder.slice(1), // remove driverStart from the array
    stopEtas,
    hasErrors: Object.values(stopEtas).some((eta) => eta.sequenceError),
  };
}

// Functional version of addPassengerToTrip
async function addPassengerToTrip(
  tripId: string,
  newPassenger: any, 
  optimizedRoute: any
): Promise<any | null> {
  // Use your Trip type
  const departureTime = new Date(
    Math.max(
      new Date(newPassenger.earliestPickupTime ?? Date.now()).getTime(),
      Date.now()
    )
  );
  console.log(`[ADD_PASSENGER] Adding P-${newPassenger.id} to Trip ${tripId}.`);
  try {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: true,
        assignments: { include: { passenger: true } },
      },
    });
    if (!existingTrip || !existingTrip.driver) {
      console.error(`[ADD_PASSENGER] Could not find existing trip ${tripId}`);
      return null;
    }
    const waypointsForAPI = [
      ...existingTrip.assignments.flatMap((a: any) => [
        {
          id: `${a.passengerId}-pickup`,
          type: 'PICKUP' as const,
          passengerId: a.passengerId,
          lat: a.passenger.pickupLat,
          lng: a.passenger.pickupLng,
        },
        {
          id: `${a.passengerId}-dropoff`,
          type: 'DROPOFF' as const,
          passengerId: a.passengerId,
          lat: a.passenger.dropoffLat,
          lng: a.passenger.dropoffLng,
        },
      ]),
      {
        id: `${newPassenger.id}-pickup`,
        type: 'PICKUP' as const,
        passengerId: newPassenger.id,
        lat: newPassenger.pickupLat,
        lng: newPassenger.pickupLng,
      },
      {
        id: `${newPassenger.id}-dropoff`,
        type: 'DROPOFF' as const,
        passengerId: newPassenger.id,
        lat: newPassenger.dropoffLat,
        lng: newPassenger.dropoffLng,
      },
    ];
    const { finalStopOrder, stopEtas } = parseGoogleRoute(
      departureTime,
      {
        lat: existingTrip.driver.currentLat!,
        lng: existingTrip.driver.currentLng!,
      },
      waypointsForAPI,
      optimizedRoute
    );
    return await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { orderedWaypointsJson: JSON.stringify(finalStopOrder) },
      });
      for (const assignment of existingTrip.assignments) {
        const newTimes = stopEtas[assignment.passengerId];
        if (newTimes) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: { ...newTimes },
          });
        }
      }
      const newPassengerTimes = stopEtas[newPassenger.id];
      const finalTimes = { ...newPassengerTimes };
      if (finalTimes.estimatedPickupTime && !finalTimes.estimatedDropoffTime) {
        const rideDurationSeconds =
          (newPassenger.estimatedDurationMin || 20) * 60;
        finalTimes.estimatedDropoffTime = new Date(
          finalTimes.estimatedPickupTime.getTime() + rideDurationSeconds * 1000
        );
        console.log(
          `[ADD_PASSENGER] Calculated missing estimatedDropoffTime for passenger ${newPassenger.id}: ${finalTimes.estimatedDropoffTime.toISOString()}`
        );
      }
      await tx.assignment.create({
        data: {
          driverId: existingTrip.driverId,
          passengerId: newPassenger.id,
          status: 'CONFIRMED',
          tripId,
          ...finalTimes,
        },
      });
      await tx.passenger.update({
        where: { id: newPassenger.id },
        data: {
          status: 'ASSIGNED',
          assignedDriverId: existingTrip.driverId,
        },
      });
      console.log(
        `[TRIP ENHANCED] Successfully added passenger ${newPassenger.id} to trip ${tripId}`
      );
      return updatedTrip;
    });
  } catch (error) {
    console.error(`Error adding passenger to trip ${tripId}:`, error);
    return null;
  }
}



// Functional version of confirmPickup
async function confirmPickup(
  assignmentId: string,
  actualPickupTimestamp: Date
): Promise<void> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    throw new Error(`Assignment with ID ${assignmentId} not found.`);
  }
  await prisma.$transaction([
    prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'IN_PROGRESS',
        actualPickupTime: actualPickupTimestamp,
      },
    }),
    prisma.driver.update({
      where: { id: assignment.driverId },
      data: { status: 'EN_ROUTE_TO_DROPOFF' },
    }),
  ]);
  console.log(
    `Driver ${assignment.driverId} confirmed pickup for assignment ${assignmentId} at ${actualPickupTimestamp.toLocaleTimeString()}`
  );
  // TODO: Optionally call findAndAddOnRoutePassenger(assignmentId) if ported
}

// Functional version of completeTrip
async function completeTrip(tripId: string): Promise<void> {
  console.log(
    `[CHAINING] Trip ${tripId} completed. Searching for next ride...`
  );
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { driver: true },
  });
  if (!trip || !trip.driver) {
    console.error(`[CHAINING] Could not find trip ${tripId} to complete.`);
    return;
  }
  const driver = trip.driver;
  const lastDropoffLocation = {
    lat: driver.lastDropoffLat!,
    lng: driver.lastDropoffLng!,
  };
  // TODO: Replace with a functional getUnassignedPassengers
  const unassignedPassengers = await prisma.passenger.findMany({
    where: { status: 'UNASSIGNED' },
  });
  if (unassignedPassengers.length === 0) {
    console.log(
      `[CHAINING] No unassigned passengers. Setting driver ${driver.id} to IDLE.`
    );
    await prisma.driver.update({
      where: { id: driver.id },
      data: { status: 'IDLE' },
    });
    return;
  }
  const matrix = await gms.getDistanceMatrix({
    origins: [lastDropoffLocation],
    destinations: unassignedPassengers.map((p: any) => ({
      lat: p.pickupLat,
      lng: p.pickupLng,
    })),
  });
  if (!matrix?.[0]) {
    console.log(
      `[CHAINING] Could not get travel times. Setting driver ${driver.id} to IDLE.`
    );
    await prisma.driver.update({
      where: { id: driver.id },
      data: { status: 'IDLE' },
    });
    return;
  }
  let bestChainedRide: { score: number; passenger: any; travelInfo: any } = {
    score: Infinity,
    passenger: null,
    travelInfo: null,
  };
  const MAX_CHAIN_PICKUP_SECONDS = 15 * 60;
  matrix[0].forEach((element: any, index: number) => {
    if (
      element.status === 'OK' &&
      element.duration.value < MAX_CHAIN_PICKUP_SECONDS
    ) {
      const score = element.duration.value;
      if (score < bestChainedRide.score) {
        bestChainedRide = {
          score,
          passenger: unassignedPassengers[index],
          travelInfo: element,
        };
      }
    }
  });
  if (bestChainedRide.passenger) {
    console.log(
      `[CHAINING] Found next ride for driver ${driver.id}: P-${bestChainedRide.passenger.id}`
    );
    const rideDuration =
      (bestChainedRide.passenger.estimatedDurationMin || 30) * 60;
    const driverAvailableTime = driver.lastDropoffTimestamp || new Date();
    await assignBestMatch({
      passenger: bestChainedRide.passenger,
      driver: driver,
      estimatedPickupTime: new Date(
        driverAvailableTime.getTime() +
          bestChainedRide.travelInfo.duration.value * 1000
      ),
      passengerRideDurationSeconds: rideDuration,
    });
  } else {
    console.log(
      `[CHAINING] No suitable next ride found for driver ${driver.id}. Setting to IDLE.`
    );
    await prisma.driver.update({
      where: { id: driver.id },
      data: { status: 'IDLE' },
    });
  }
}

export { parseGoogleRoute, addPassengerToTrip, confirmPickup, completeTrip };

export {
  runAssignmentCycle,
  mapPickupTimesToTargetDate,
  assignBestMatch,
  detectCarpoolOpportunities,
  calculateDistance,
  calculateDirectionCompatibility,
};
