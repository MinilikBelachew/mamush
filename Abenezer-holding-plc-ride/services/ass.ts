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
  timeWindow: { start: Date; end: Date };
}

export interface CarpoolGroup {
  groupId: string;
  passengers: Passenger[];
  pickupDistance: number;
  timeGap: number;
  directionScore: number;
  combinedWindow: { start: Date; end: Date };
  optimizedRoute?: any;
}

interface DriverState {
  driver: Driver;
  nextAvailableTime: Date;
  nextAvailableLat: number;
  nextAvailableLng: number;
  schedule: any[];
  isFirstAssignment: boolean; // ✅ Add this
}


interface AssignmentDetails {
  travelTime: number;
  idleMinutes: number;
  estimatedPickupTime: Date;
  estimatedDropoffTime?: Date;
}
const CONFIG = {
  MAX_IDLE_MINUTES: 30,
  CARPOOL_DISTANCE_KM: 1,
  CARPOOL_TIME_WINDOW_MIN: 10,
  TIME_WINDOW_BUFFER_MIN: 5,
  DIRECTION_SIMILARITY_THRESHOLD: 0.7,
  MAX_CARPOOL_CAPACITY: 4,
};

// Interfaces







// --- Google Maps Service Selection ---
const gms =
  process.env.USE_MOCK_MAPS === 'true'
    ? new MockGoogleMapsService()
    : new GoogleMapsService();



// Helper Functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
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

function averageCoordinates(coords: { lat: number; lng: number }[]): { lat: number; lng: number } {
  const avgLat = coords.reduce((sum, loc) => sum + loc.lat, 0) / coords.length;
  const avgLng = coords.reduce((sum, loc) => sum + loc.lng, 0) / coords.length;
  return { lat: avgLat, lng: avgLng };
}

async function detectAndOptimizeCarpools(passengers: Passenger[]): Promise<CarpoolGroup[]> {
  const potentialGroups: PotentialGroup[] = [];

  for (let i = 0; i < passengers.length; i++) {
    for (let j = i + 1; j < passengers.length; j++) {
      const p1 = passengers[i];
      const p2 = passengers[j];

      if (!p1.pickupLat || !p1.pickupLng || !p1.dropoffLat || !p1.dropoffLng || !p1.earliestPickupTime ||
          !p2.pickupLat || !p2.pickupLng || !p2.dropoffLat || !p2.dropoffLng || !p2.earliestPickupTime) {
        continue;
      }

      const distance = calculateDistance(p1.pickupLat, p1.pickupLng, p2.pickupLat, p2.pickupLng);
      if (distance > CONFIG.CARPOOL_DISTANCE_KM) continue;

      const p1Start = new Date(p1.earliestPickupTime);
      const p1End = new Date(p1.latestPickupTime || p1Start.getTime() + 3600000);
      const p2Start = new Date(p2.earliestPickupTime);
      const p2End = new Date(p2.latestPickupTime || p2Start.getTime() + 3600000);

      const timeGap = Math.abs(p1Start.getTime() - p2Start.getTime()) / 60000;
      const windowStart = new Date(Math.max(p1Start.getTime(), p2Start.getTime()));
      const windowEnd = new Date(Math.min(p1End.getTime(), p2End.getTime()));
      const overlapMinutes = (windowEnd.getTime() - windowStart.getTime()) / 60000;

      if (overlapMinutes < CONFIG.CARPOOL_TIME_WINDOW_MIN) continue;

      const directionScore = await calculateDirectionCompatibility(p1, p2);
      if (directionScore < CONFIG.DIRECTION_SIMILARITY_THRESHOLD) continue;

      potentialGroups.push({
        passengers: [p1, p2],
        distance,
        timeGap,
        directionScore,
        timeWindow: { start: windowStart, end: windowEnd }
      });
    }
  }

  const sortedGroups = [...potentialGroups].sort((a, b) => {
    const scoreA = (1 - a.distance) * 0.4 + (1 - (a.timeGap / 10)) * 0.3 + a.directionScore * 0.3;
    const scoreB = (1 - b.distance) * 0.4 + (1 - (b.timeGap / 10)) * 0.3 + b.directionScore * 0.3;
    return scoreB - scoreA;
  });

  const finalGroups: CarpoolGroup[] = [];
  const assignedPassengers = new Set<string>();

  for (const group of sortedGroups) {
    const passengerIds = group.passengers.map(p => p.id);
    if (passengerIds.some(id => assignedPassengers.has(id))){
        continue; // Skip if any passenger is already assigned
    }

    try {
      const optimizedRoute = await gms.optimizeRoute({
        origin: { lat: group.passengers[0].pickupLat!, lng: group.passengers[0].pickupLng! },
        waypoints: group.passengers.flatMap(p => [
          { location: { lat: p.pickupLat!, lng: p.pickupLng! }, stopType: 'PICKUP' },
          { location: { lat: p.dropoffLat!, lng: p.dropoffLng! }, stopType: 'DROPOFF' }
        ]),
        departureTime: group.timeWindow.start
      });

      const distance = optimizedRoute?.legs?.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0) / 1000 || 0;
      
      let pickupTimes: number[] = [];
      optimizedRoute?.legs?.forEach((leg: any, index: number) => {
        if (index % 2 === 0) pickupTimes.push(leg.duration.value);
      });

      const timeGap = pickupTimes.length > 1 ? (Math.max(...pickupTimes) - Math.min(...pickupTimes)) / 60 : 0;

      finalGroups.push({
        groupId: `CARPOOL_${passengerIds.join('_')}`,
        passengers: group.passengers,
        pickupDistance: distance,
        timeGap,
        directionScore: group.directionScore,
        combinedWindow: group.timeWindow,
        optimizedRoute
      });

      passengerIds.forEach(id => assignedPassengers.add(id));
    } catch (error) {
      console.error(`Failed to optimize route for carpool group: ${error}`);
    }
  }

  return finalGroups;
}


function calculateOptimizedMetrics(optimizedRoute: any): { distance: number; timeGap: number } {
  if (!optimizedRoute?.legs?.length) return { distance: 0, timeGap: 0 };
  
  // Calculate total distance
  const distance = optimizedRoute.legs.reduce(
    (sum: number, leg: any) => sum + (leg.distance?.value || 0),
    0
  ) / 1000; // Convert to km

  // Calculate time gap between first and last pickup
  let pickupTimes: number[] = [];
  optimizedRoute.legs.forEach((leg: any, index: number) => {
    if (index % 2 === 0) { // Assuming even indices are pickups
      pickupTimes.push(leg.duration.value);
    }
  });

  const timeGap = pickupTimes.length > 1 
    ? (Math.max(...pickupTimes) - Math.min(...pickupTimes)) / 60 
    : 0;

  return {
    distance,
    timeGap
  };
}





async function calculateDirectionCompatibility(p1: Passenger, p2: Passenger): Promise<number> {
  const p1Vector = { lat: p1.dropoffLat! - p1.pickupLat!, lng: p1.dropoffLng! - p1.pickupLng! };
  const p2Vector = { lat: p2.dropoffLat! - p2.pickupLat!, lng: p2.dropoffLng! - p2.pickupLng! };

  const p1Magnitude = Math.sqrt(p1Vector.lat ** 2 + p1Vector.lng ** 2);
  const p2Magnitude = Math.sqrt(p2Vector.lat ** 2 + p2Vector.lng ** 2);

  if (p1Magnitude < 0.0001 || p2Magnitude < 0.0001) return 0;

  const dotProduct = p1Vector.lat * p2Vector.lat + p1Vector.lng * p2Vector.lng;
  const cosineSimilarity = dotProduct / (p1Magnitude * p2Magnitude);
  const vectorScore = (cosineSimilarity + 1) / 2;

  if (vectorScore < CONFIG.DIRECTION_SIMILARITY_THRESHOLD) return 0;

  try {
    const deviation = await gms.calculateRouteDeviation(
      { lat: p1.pickupLat!, lng: p1.pickupLng! },
      { lat: p1.dropoffLat!, lng: p1.dropoffLng! },
      { lat: p2.pickupLat!, lng: p2.pickupLng! }
    );
    const deviationScore = 1 - Math.min(deviation / 2000, 1);
    return (vectorScore * 0.6 + deviationScore * 0.4);
  } catch (error) {
    console.error(`Direction check failed: ${error}`);
    return vectorScore;
  }
}

async function forceBestIdleAssignments(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<Assignment[]> {
  const assignments: Assignment[] = [];

  for (const passenger of passengers) {
    let bestDriver: DriverState | null = null;
    let bestDetails: AssignmentDetails | null = null;
    let minIdle = Infinity;

    for (const driver of drivers) {
      const { cost, details } = await calculateAssignmentCost(driver, passenger);

      if (details.idleMinutes < minIdle) {
        bestDriver = driver;
        bestDetails = details;
        minIdle = details.idleMinutes;
      }
    }

    if (bestDriver && bestDetails) {
      console.warn(
        `[FORCED ASSIGNMENT] Passenger ${passenger.id} assigned to Driver ${bestDriver.driver.id} with ${bestDetails.idleMinutes.toFixed(1)} min idle`
      );

      assignments.push({
        driverId: bestDriver.driver.id,
        passengerId: passenger.id,
        estimatedPickupTime: bestDetails.estimatedPickupTime,
        estimatedDropoffTime: bestDetails.estimatedDropoffTime,
        status: 'CONFIRMED',
      });

      bestDriver.nextAvailableTime = bestDetails.estimatedDropoffTime!;
      bestDriver.nextAvailableLat = passenger.dropoffLat!;
      bestDriver.nextAvailableLng = passenger.dropoffLng!;
    }
  }

  return assignments;
}


async function optimizeAssignmentsGlobally(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<Assignment[]> {
  const { costMatrix, viablePairs,rejectedIdlePairs } = await buildCostMatrix(drivers, passengers);
if (viablePairs.length === 0) {
  console.warn('[WARNING] No viable assignments found. Falling back.');
  return await forceBestIdleAssignments(drivers, passengers);
}


  const optimalAssignments = hungarianAlgorithm(costMatrix);
  const { successfulAssignments } = await processAssignments(optimalAssignments, viablePairs, drivers, passengers);
  return successfulAssignments;
}
async function buildCostMatrix(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<{
  costMatrix: number[][];
  viablePairs: { driverIdx: number; passengerIdx: number; details: AssignmentDetails }[];
}> {
  const viablePairs: { driverIdx: number; passengerIdx: number; details: AssignmentDetails }[] = [];
  const costMatrix = Array(drivers.length).fill(null).map(() => Array(passengers.length).fill(Infinity));

  for (let d = 0; d < drivers.length; d++) {
    for (let p = 0; p < passengers.length; p++) {
      const { cost, details } = await calculateAssignmentCost(drivers[d], passengers[p]);
      costMatrix[d][p] = cost;
      if (cost < Infinity) {
        viablePairs.push({ driverIdx: d, passengerIdx: p, details });
      }
    }
  }
  
  const rejectedIdlePairs: { driverIdx: number; passengerIdx: number }[] = [];

for (let d = 0; d < drivers.length; d++) {
  for (let p = 0; p < passengers.length; p++) {
    const { cost, details, reason } = await calculateAssignmentCost(drivers[d], passengers[p]);
    costMatrix[d][p] = cost;

    if (cost < Infinity) {
      viablePairs.push({ driverIdx: d, passengerIdx: p, details });
    } else if (reason === 'IDLE_EXCEEDED') {
      rejectedIdlePairs.push({ driverIdx: d, passengerIdx: p });
    }
  }
}
console.log(`[DEBUG] Viable pairs: ${viablePairs.length}, Rejected due to idle: ${rejectedIdlePairs.length}`);


  return { costMatrix, viablePairs, rejectedIdlePairs };
}

async function calculateAssignmentCost(
  driver: DriverState,
  passenger: Passenger
): Promise<{ cost: number; details: AssignmentDetails; reason?: string }> {
  if (!passenger.pickupLat || !passenger.pickupLng) {
    return { cost: Infinity, details: {} as AssignmentDetails };
  }

  const travelTime = await gms.getTravelTimeInSeconds({
    origin: { lat: driver.nextAvailableLat, lng: driver.nextAvailableLng },
    destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
    departure_time: Math.floor(driver.nextAvailableTime.getTime() / 1000)
  }) || Infinity;

  if (travelTime === Infinity) {
    return { cost: Infinity, details: {} as AssignmentDetails };
  }

  const arrivalTime = new Date(driver.nextAvailableTime.getTime() + travelTime * 1000);
  const passengerLatest = new Date(passenger.latestPickupTime || passenger.earliestPickupTime!.getTime() + 3600000);
  const passengerEarliest = new Date(passenger.earliestPickupTime!);
  
  const bufferMs = CONFIG.TIME_WINDOW_BUFFER_MIN * 60 * 1000;
  const latestWithBuffer = new Date(passengerLatest.getTime() + bufferMs);
  const earliestWithBuffer = new Date(passengerEarliest.getTime() - bufferMs);
  
  if (arrivalTime > latestWithBuffer) {
    return { cost: Infinity, details: {} as AssignmentDetails };
  }

  const mustLeaveBy = new Date(
    Math.max(earliestWithBuffer.getTime() - travelTime * 1000, driver.nextAvailableTime.getTime())
  );
  const idleMinutes = (mustLeaveBy.getTime() - driver.nextAvailableTime.getTime()) / (1000 * 60);

  let cost = travelTime;
if (!driver.isFirstAssignment && idleMinutes > CONFIG.MAX_IDLE_MINUTES) {
  // 👇 If under 2hr idle, still allow it with penalty
  const RELAXED_IDLE_THRESHOLD = 120;
  if (idleMinutes <= RELAXED_IDLE_THRESHOLD) {
    const penalty = idleMinutes * 60; // Penalize heavily
    return {
      cost: travelTime + penalty,
      details: {
        travelTime,
        idleMinutes,
        estimatedPickupTime: arrivalTime,
        estimatedDropoffTime: new Date(
          arrivalTime.getTime() + (passenger.estimatedDurationMin || 20) * 60000
        ),
      }
    };
  } else {
    return {
      cost: Infinity,
      details: {
        travelTime,
        idleMinutes,
        estimatedPickupTime: arrivalTime,
      },
      reason: 'IDLE_EXCEEDED'
    };
  }
}



//   if (driver.capacityLeft < (passenger.groupSize || 1)) {
//     return { cost: Infinity, details: {} as AssignmentDetails };
//   }

  return {
    cost,
    details: {
      travelTime,
      idleMinutes,
      estimatedPickupTime: new Date(Math.max(arrivalTime.getTime(), earliestWithBuffer.getTime())),
      estimatedDropoffTime: new Date(
        Math.max(arrivalTime.getTime(), earliestWithBuffer.getTime()) + 
        (passenger.estimatedDurationMin || 20) * 60 * 1000
      )
    }
  };
}

function hungarianAlgorithm(costMatrix: number[][]): Assignment[] {
  if (costMatrix.length === 0 || costMatrix[0].length === 0) {
    return [];
  }

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

  // Step 1: Subtract row minima
  for (let i = 0; i < size; i++) {
    const min = Math.min(...paddedMatrix[i]);
    for (let j = 0; j < size; j++) {
      paddedMatrix[i][j] -= min;
    }
  }

  // Step 2: Subtract column minima
  for (let j = 0; j < size; j++) {
    const min = Math.min(...paddedMatrix.map(row => row[j]));
    for (let i = 0; i < size; i++) {
      paddedMatrix[i][j] -= min;
    }
  }

  // Steps 3-7: Find optimal assignments
  const assignments: Assignment[] = [];
  const rowCovered = Array(size).fill(false);
  const colCovered = Array(size).fill(false);

  while (true) {
    const uncoveredZero = findUncoveredZero(paddedMatrix, rowCovered, colCovered);
    if (!uncoveredZero) break;

    const primedZero = uncoveredZero;
    const starredInRow = assignments.find(a => a.driverIndex === primedZero.row);
    
    if (!starredInRow) {
      assignments.push({
        driverIndex: primedZero.row,
        passengerIndex: primedZero.col,
        cost: costMatrix[primedZero.row]?.[primedZero.col] ?? Infinity
      });
      rowCovered[primedZero.row] = true;
      colCovered[primedZero.col] = true;
    } else {
      rowCovered[primedZero.row] = true;
      colCovered[starredInRow.passengerIndex] = false;
    }

    const minUncovered = findMinUncovered(paddedMatrix, rowCovered, colCovered);
    
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

  return assignments.filter(assn => 
    assn.driverIndex < rows && 
    assn.passengerIndex < cols &&
    assn.cost < Infinity
  );
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

function processAssignments(
  assignments: Assignment[],
  viablePairs: { driverIdx: number; passengerIdx: number; details: AssignmentDetails }[],
  drivers: DriverState[],
  passengers: Passenger[]
): {
  successfulAssignments: Assignment[];
  unassignedPassengers: Passenger[];
} {
  const successfulAssignments: Assignment[] = [];
  const assignedPassengerIndices = new Set<number>();

  assignments.forEach(assignment => {
    const pair = viablePairs.find(
      p => p.driverIdx === assignment.driverIndex && 
           p.passengerIdx === assignment.passengerIndex
    );

    if (pair) {
      const driver = drivers[pair.driverIdx];
      const passenger = passengers[pair.passengerIdx];

      // Create assignment
      const newAssignment: Assignment = {
        driverId: driver.driver.id,
        passengerId: passenger.id,
        estimatedPickupTime: pair.details.estimatedPickupTime,
        estimatedDropoffTime: pair.details.estimatedDropoffTime,
        status: 'CONFIRMED',
      };

      successfulAssignments.push(newAssignment);

      // Update driver state
      driver.nextAvailableTime = pair.details.estimatedDropoffTime!;
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

// Fallback assignment handler
async function handleFallbackAssignments(
  drivers: DriverState[],
  passengers: Passenger[]
): Promise<{ assignments: Assignment[]; warnings: string[] }> {
  const results = {
    assignments: [] as Assignment[],
    warnings: [] as string[]
  };

  for (const passenger of passengers) {
    let bestDriver: DriverState | null = null;
    let bestDetails: AssignmentDetails | null = null;
    let minCost = Infinity;

    for (const driver of drivers) {

      const { cost, details } = await calculateAssignmentCost(driver, passenger);
      
      if (cost < minCost) {
        minCost = cost;
        bestDriver = driver;
        bestDetails = details;
      }
    }

    if (bestDriver && bestDetails) {
      if (bestDetails.idleMinutes > 30) {
        results.warnings.push(
          `Suboptimal assignment: Driver ${bestDriver.driver.id} to Passenger ${passenger.id} ` +
          `with idle time ${bestDetails.idleMinutes.toFixed(1)} minutes`
        );
      }

      const newAssignment: Assignment = {
        driverId: bestDriver.driver.id,
        passengerId: passenger.id,
        estimatedPickupTime: bestDetails.estimatedPickupTime,
        estimatedDropoffTime: bestDetails.estimatedDropoffTime,
        status: 'CONFIRMED',
      };

      results.assignments.push(newAssignment);

      // Update driver state
      bestDriver.nextAvailableTime = bestDetails.estimatedDropoffTime!;
      bestDriver.nextAvailableLat = passenger.dropoffLat!;
      bestDriver.nextAvailableLng = passenger.dropoffLng!;
    } else {
      results.warnings.push(
        `Could not assign Passenger ${passenger.id} - no available drivers`
      );
    }
  }

  return results;
}

// Main assignment cycle
async function runAssignmentCycle(cycleDate?: Date): Promise<void> {
  const targetDate = cycleDate || new Date();
  console.log(`Starting assignment cycle for ${targetDate.toISOString()}`);

  // Phase 1: Get all data
  const [activeDrivers, unassignedPassengers] = await Promise.all([
    prisma.driver.findMany({ where: { status: 'IDLE' } }),
    prisma.passenger.findMany({ where: { status: 'UNASSIGNED' } }),
  ]);

  if (activeDrivers.length === 0 || unassignedPassengers.length === 0) {
    console.log('No drivers or passengers available');
    return;
  }

  // Phase 1.5: Carpool detection
  const carpoolGroups = await detectAndOptimizeCarpools(unassignedPassengers);
  const carpooledPassengerIds = new Set(
    carpoolGroups.flatMap(g => g.passengers.map(p => p.id))
  );
  const remainingPassengers = unassignedPassengers.filter(
    p => !carpooledPassengerIds.has(p.id)
  );

  // Create virtual passengers for carpool groups
  const carpoolVirtualPassengers = carpoolGroups.map(group => ({
    ...group.passengers[0],
    id: group.groupId,
    isCarpool: true,
    originalPassengers: group.passengers,
    groupSize: group.passengers.reduce((sum, p) => sum + (p.groupSize || 1), 0),
    earliestPickupTime: group.combinedWindow.start,
    latestPickupTime: group.combinedWindow.end,
    pickupLat: averageLat(group.passengers.map(p => p.pickupLat!)),
    pickupLng: averageLng(group.passengers.map(p => p.pickupLng!)),
    dropoffLat: group.passengers[0].dropoffLat,
    dropoffLng: group.passengers[0].dropoffLng,
  }));

  const allPassengersForAssignment = [
    ...carpoolVirtualPassengers,
    ...remainingPassengers
  ];

  // Phase 2: Build driver states
 const driversState = await Promise.all(
  activeDrivers.map(async (driver) => {
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

    // Check current assignment
    const currentAssignment = driverWithDetails.assignments[0];
    if (currentAssignment?.estimatedDropoffTime) {
      if (currentAssignment.estimatedDropoffTime > nextAvailableTime) {
        nextAvailableTime = new Date(currentAssignment.estimatedDropoffTime);
        nextAvailableLat = currentAssignment.passenger?.dropoffLat || nextAvailableLat;
        nextAvailableLng = currentAssignment.passenger?.dropoffLng || nextAvailableLng;
      }
    }

    // Check last trip
    const lastTrip = driverWithDetails.trips[0];
    if (lastTrip?.assignments?.[lastTrip.assignments.length - 1]?.estimatedDropoffTime) {
      const tripDropoff = lastTrip.assignments[lastTrip.assignments.length - 1].estimatedDropoffTime;
      if (tripDropoff && tripDropoff > nextAvailableTime) {
        nextAvailableTime = new Date(tripDropoff);
        const lastTripAssignment = lastTrip.assignments[lastTrip.assignments.length - 1];
        nextAvailableLat = lastTripAssignment.passenger?.dropoffLat || nextAvailableLat;
        nextAvailableLng = lastTripAssignment.passenger?.dropoffLng || nextAvailableLng;
      }
    }

    const isFirstAssignment = !currentAssignment && (!lastTrip || lastTrip.assignments.length === 0);

    return {
      driver,
      nextAvailableTime,
      nextAvailableLat,
      nextAvailableLng,
      schedule: [],
      isFirstAssignment, // ✅ Add this line
    };
  })
);

  const validDriversState = driversState.filter((ds): ds is DriverState => ds !== null);

  // Phase 3: Global optimization
  const optimizedAssignments = await optimizeAssignmentsGlobally(
    validDriversState,
    allPassengersForAssignment
  );

  // Track assigned passengers
  const assignedPassengerIds = new Set(optimizedAssignments.map(a => a.passengerId));

  // Phase 4: Fallback assignments
  const stillUnassigned = allPassengersForAssignment.filter(
    p => !assignedPassengerIds.has(p.id)
  );

  let fallbackResults = { assignments: [] as Assignment[], warnings: [] as string[] };
  if (stillUnassigned.length > 0) {
    fallbackResults = await handleFallbackAssignments(
      validDriversState,
      stillUnassigned
    );
  }

  // Phase 5: Commit to database
  const allAssignments = [...optimizedAssignments, ...fallbackResults.assignments];
  await commitScheduleToDatabase(allAssignments);

  // Phase 6: Reporting
  const finalUnassigned = allPassengersForAssignment.filter(
    p => !assignedPassengerIds.has(p.id) && 
         !fallbackResults.assignments.some(a => a.passengerId === p.id)
  );

  console.log(`Assignment complete. Results:
    - Successfully assigned: ${allAssignments.length}
    - Carpool groups formed: ${carpoolGroups.length}
    - Remaining unassigned: ${finalUnassigned.length}
    - Warnings: ${fallbackResults.warnings.length}`);

  fallbackResults.warnings.forEach(warning => console.warn(warning));
  
  
}

// Helper functions
function averageLat(coords: number[]): number {
  return coords.reduce((sum, lat) => sum + lat, 0) / coords.length;
}

function averageLng(coords: number[]): number {
  return coords.reduce((sum, lng) => sum + lng, 0) / coords.length;
}

async function commitScheduleToDatabase(
  assignments: Assignment[]
): Promise<Assignment[]> {
  return await prisma.$transaction(async (tx) => {
    const created: Assignment[] = [];
    for (const a of assignments) {
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
    }
    return created;
  });
}

export {
  runAssignmentCycle,
};