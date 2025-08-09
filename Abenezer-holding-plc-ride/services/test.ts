import { AssignmentStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { haversineDistance, hungarianAlgorithm } from '@utils/util';
import { DateTime } from 'luxon';
import { MapboxService } from './mapbox';
// import { GoogleMapsService } from './googleMap';

interface Driver {
  id: string;
  currentLat: number;
  currentLng: number;
}
interface Assignment {
  driverId: string;
  passengerId: string;
  estimatedPickupTime: Date;
  estimatedDropoffTime: Date;
  status: AssignmentStatus;
}

// interface BatchTravelRequest {
//   origin: Location;
//   destination: Location;
//   driverId: string;
//   passengerId: string;
// }

// interface BatchTravelResult {
//   driverId: string;
//   passengerId: string;
//   travelTimeMinutes: number;
// }

interface Passenger {
  id: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedPickupTime: Date | string;
  estimatedDurationMin?: Date | string; // in minutes
  estimatedDropoffTime: Date | string;
  earliestPickupTime: Date | string;
  latestPickupTime: Date | string;
}
const prisma = new PrismaClient();
const MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR = 100;
// util/hungarian.ts


export function calculateMockDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return 9999;
  }
  const dx = lat1 - lat2;
  const dy = lng1 - lng2;
  return Math.sqrt(dx * dx + dy * dy);
}

async function assignPassengersToDrivers(
  drivers: Driver[],
  passengers: Passenger[],
  targetDate: Date
) {
  console.log(
    'Drivers:',
    drivers.map((d) => ({ id: d.id, lat: d.currentLat, lng: d.currentLng }))
  );
  console.log(
    'Passengers:',
    passengers.map((p) => ({
      id: p.id,
      pickupLat: p.pickupLat,
      pickupLng: p.pickupLng,
    }))
  );
  const assignmets: Assignment[] = [];
  const remainingPassengers = [...passengers];
  const USE_MOCK_MAPS = process.env.USE_MOCK_MAPS === 'true';
  let mapsService: MapboxService | null = null;

  if (!USE_MOCK_MAPS) {
    if (!process.env.MAPBOX_API_KEY) {
      throw new Error(
        'Google Maps API key is required when USE_MOCK_MAPS=false. ' +
          'Please set GOOGLE_MAPS_API_KEY in your environment variables.'
      );
    }

    try {
      mapsService = new MapboxService();
      console.log('Google Maps service initialized successfully');
    } catch (error) {
      throw new Error(
        `Failed to initialize Google Maps service: ${
          error instanceof Error ? error.message : String(error)
        }. Either fix the Google Maps configuration or set USE_MOCK_MAPS=true.`
      );
    }
  }

  console.log(`Operating in ${USE_MOCK_MAPS ? 'MOCK' : 'LIVE'} mode`);

  const driverStates: {
    id: string;
    lastDropoffTime: DateTime;
    currentLat: number;
    currentLng: number;
  }[] = drivers.map((driver) => ({
    id: driver.id,
    lastDropoffTime:
      DateTime.fromJSDate(targetDate).setZone('America/New_York'),
    currentLat: driver.currentLat,
    currentLng: driver.currentLng,
  }));

 

  async function getBatchTravelTimes(
  driverStates: { id: string; currentLat: number; currentLng: number }[],
  passengers: Passenger[]
): Promise<Map<string, Map<string, number>>> {
  const results = new Map<string, Map<string, number>>();
  const MAX_MATRIX_POINTS = 25;
  const MAX_DESTINATIONS = MAX_MATRIX_POINTS - 1;

  // Initialize results map
  driverStates.forEach((driver) => {
    results.set(driver.id, new Map<string, number>());
  });

  if (USE_MOCK_MAPS) {
    // Mock mode - calculate all distances locally
    driverStates.forEach((driver) => {
      passengers.forEach((passenger) => {
        const distance = calculateMockDistance(
          driver.currentLat,
          driver.currentLng,
          passenger.pickupLat,
          passenger.pickupLng
        );
        results
          .get(driver.id)!
          .set(passenger.id, distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR);
      });
    });
    return results;
  }

  if (!mapsService) {
    throw new Error('Google Maps service is not available');
  }

  for (const driver of driverStates) {
    const driverResults = results.get(driver.id)!;

    // Break passengers into batches of MAX_DESTINATIONS
    for (let i = 0; i < passengers.length; i += MAX_DESTINATIONS) {
      const batch = passengers.slice(i, i + MAX_DESTINATIONS);
      const destinations = batch.map((p) => ({
        lat: p.pickupLat,
        lng: p.pickupLng,
      }));

      const allCoords = [
        { lat: driver.currentLat, lng: driver.currentLng },
        ...destinations,
      ];

      // Double-check we never exceed Mapbox limit
      if (allCoords.length > MAX_MATRIX_POINTS) {
        console.warn(
          `Skipping batch: driver + ${destinations.length} passengers exceeds 25-point limit.`
        );
        continue;
      }

      try {
        const matrix = await mapsService.getDistanceMatrix({
          origins: [allCoords[0]],
          destinations,
          mode: 'driving',
        });

        if (matrix && matrix[0]) {
          batch.forEach((passenger, index) => {
            const element = matrix[0][index];
            if (element && typeof element.duration === 'number') {
              driverResults.set(passenger.id, element.duration / 60); // seconds to minutes
            } else {
              console.error(
                `Invalid element for driver ${driver.id} to passenger ${passenger.id}`
              );
              driverResults.set(passenger.id, 9999);
            }
          });
        } else {
          console.warn(`Matrix API returned no data for driver ${driver.id}`);
          batch.forEach((passenger) => {
            driverResults.set(passenger.id, 9999);
          });
        }
      } catch (error) {
        console.error(
          `Batch request failed for driver ${driver.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        batch.forEach((passenger) => {
          driverResults.set(passenger.id, 9999);
        });
      }
    }
  }

  return results;
}

  const assignedPassengerIds = new Set<string>();
  while (remainingPassengers.length > 0) {
    const batchResults = await getBatchTravelTimes(
      driverStates,
      remainingPassengers
    );

    const costMatrix = driverStates.map((driver) =>
      remainingPassengers.map((passenger) => {
        const estimatedTravelTimeMinutes =
          batchResults.get(driver.id)?.get(passenger.id) ?? 9999;
        if (estimatedTravelTimeMinutes === 9999) {
          console.warn(
            `No valid travel time for driver ${driver.id} to passenger ${passenger.id}`
          );
          return 9999;
        }

        // const estimatedTravelTimeMinutes =
        //   distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;

        // Parse passenger earliest and latest times directly into Luxon DateTime objects
        const earliestPickupTime =
          typeof passenger.earliestPickupTime === 'string'
            ? passenger.earliestPickupTime
            : (passenger.earliestPickupTime as Date).toISOString();

        const earliestLuxon = DateTime.fromISO(earliestPickupTime, {
          zone: 'America/New_York',
        });
        const latestPickupTime =
          typeof passenger.latestPickupTime === 'string'
            ? passenger.latestPickupTime
            : (passenger.latestPickupTime as Date).toISOString();

        const latestLuxon = DateTime.fromISO(latestPickupTime, {
          zone: 'America/New_York',
        });

        if (!earliestLuxon.isValid || !latestLuxon.isValid) {
          // Use .isValid on Luxon object
          console.warn(
            `[WARNING] Invalid earliest/latest pickup time for passenger ${passenger.id}. Skipping.`
          );
          return 9999;
        }

        const earliestPossibleArrivalAtPickup = driver.lastDropoffTime.plus({
          minutes: estimatedTravelTimeMinutes,
        });

        // Use Luxon DateTime objects for DateTime.max()
        const estimatedPickupTimeLuxon = DateTime.max(
          earliestPossibleArrivalAtPickup,
          earliestLuxon // <--- Changed from 'earliest' to 'earliestLuxon'
        );

        const isFirstTripForDriver =
          driver.lastDropoffTime.toISO() ===
          DateTime.fromJSDate(targetDate).setZone('America/New_York').toISO();
        let currentIdleTimeMinutes = 0;
        const driverDepartureTimeForThisTrip = estimatedPickupTimeLuxon.minus({
          minutes: estimatedTravelTimeMinutes,
        });

        if (!isFirstTripForDriver) {
          if (driverDepartureTimeForThisTrip > driver.lastDropoffTime) {
            currentIdleTimeMinutes = driverDepartureTimeForThisTrip.diff(
              driver.lastDropoffTime,
              'minutes'
            ).minutes;
          } else {
            // If the driver needs to leave before or at the moment they finish their last trip,
            // there's no "idle" time in the sense of waiting.
            currentIdleTimeMinutes = 0;
          }
        }
        // --- DEBUG LOGS (make sure to use .toISO() on Luxon objects) ---
        console.log(
          `[DEBUG_COST_CALC] Driver ${driver.id} to Passenger ${passenger.id}:`
        );
        console.log(
          `  Driver lastDropoffTime: ${DateTime.fromJSDate(driver.lastDropoffTime).toISO()}`
        );
        console.log(`  Est. Travel Time (min): ${estimatedTravelTimeMinutes}`);
        console.log(
          `  Earliest Possible Arrival (driver leaves at lastDropoffTime): ${earliestPossibleArrivalAtPickup.toISO()}`
        );
        console.log(`  Passenger Earliest: ${earliestLuxon.toISO()}`); // Use Luxon object
        console.log(`  Passenger Latest: ${latestLuxon.toISO()}`); // Use Luxon object
        console.log(
          `  Final Estimated Pickup Time: ${estimatedPickupTimeLuxon.toISO()}` // Use Luxon object
        );
        // Direct comparison of Luxon objects works correctly
        console.log(
          `  Is estimated >= earliest? ${estimatedPickupTimeLuxon >= earliestLuxon}`
        );
        console.log(
          `  Is estimated <= latest? ${estimatedPickupTimeLuxon <= latestLuxon}`
        );
        // --- END DEBUG LOGS ---

        const withinWindow =
          estimatedPickupTimeLuxon >= earliestLuxon &&
          estimatedPickupTimeLuxon <= latestLuxon;

        if (!withinWindow) {
          console.log(
            `[DEBUG_COST_REASON] D${driver.id} to P${passenger.id}: Out of passenger window. Est: ${estimatedPickupTimeLuxon.toISO()}, Window: ${earliestLuxon.toISO()} - ${latestLuxon.toISO()}`
          );
          return 9999;
        }

        // Apply idle time constraint after window check
        if (!isFirstTripForDriver && currentIdleTimeMinutes > 30) {
          console.log(
            `[DEBUG_COST_REASON] D${driver.id} to P${passenger.id}: Idle time too long. Idle: ${currentIdleTimeMinutes.toFixed(2)} min`
          );
          return 9999; // Too much idle time, make this an impossible assignment
        }

        // If all conditions pass, return the travel time as cost
        return estimatedTravelTimeMinutes;
      })
    );

    // const resolvedCostMatrix: number[][] = await Promise.all(
    //   costMatrix.map((row) => Promise.all(row))
    // );
    const resolvedCostMatrix: number[][] = costMatrix;
    const assignmentIndexes = hungarianAlgorithm(resolvedCostMatrix);
    console.log('[DEBUG] Cost Matrix:', resolvedCostMatrix);
    console.log('[DEBUG] Assignments:', assignmentIndexes);
    // Add the check for 9999 costs before processing assignments (as discussed in previous answer)
    if (
      assignmentIndexes.length === 0 ||
      resolvedCostMatrix.every((row) => row.every((cost) => cost === 9999))
    ) {
      console.log(
        '[DEBUG] No valid assignments found or all costs are 9999, breaking loop.'
      );
      break;
    }
    // const assignedPassengerIds = new Set<string>();
    const driversAssignedInThisCycle = new Set<string>();

    for (const [driverIdx, passengerIdx] of assignmentIndexes) {
      // Add validation for valid indices and 9999 cost
      if (
        driverIdx === -1 ||
        passengerIdx === -1 ||
        !driverStates[driverIdx] ||
        !remainingPassengers[passengerIdx]
      ) {
        console.warn(
          `[WARNING] Skipping invalid assignment index: [${driverIdx}, ${passengerIdx}]`
        );
        continue;
      }
      const assignedCost = costMatrix[driverIdx][passengerIdx];
      if (assignedCost === 9999) {
        console.log(
          `[DEBUG] Skipping assignment D${driverIdx} -> P${passengerIdx} because cost is 9999 (out of window).`
        );
        continue;
      }
      const driverId = driverStates[driverIdx].id;
      if (driversAssignedInThisCycle.has(driverId)) {
        console.warn(
          `[WARNING] Driver ${driverId} already assigned in this cycle. Skipping duplicate.`
        );
        continue;
      }

      // const driver = driverStates[driverIdx];
      // const passenger = remainingPassengers[passengerIdx];
      // const estimatedTravelTimeMinutes = await getTravelTime(
      //   driver.currentLat,
      //   driver.currentLng,
      //   passenger.pickupLat,
      //   passenger.pickupLng
      // );
      const driver = driverStates[driverIdx];
      const passenger = remainingPassengers[passengerIdx];

      if (driversAssignedInThisCycle.has(driver.id)) {
        console.warn(`Driver ${driver.id} already assigned in this cycle`);
        continue;
      }

      // Get fresh travel time for this specific assignment
      const estimatedTravelTimeMinutes: number =
        batchResults.get(driver.id)?.get(passenger.id) ?? 9999;
      if (estimatedTravelTimeMinutes === 9999) {
        console.warn(
          `Skipping assignment D${driver.id} -> P${passenger.id} due to invalid travel time from batch results.`
        );
        continue; // Skip this assignment if for some reason it's missing or invalid in the batch
      }
      // try {
      //   if (USE_MOCK_MAPS) {
      //     const distance = calculateMockDistance(
      //       driver.currentLat,
      //       driver.currentLng,
      //       passenger.pickupLat,
      //       passenger.pickupLng
      //     );
      //     estimatedTravelTimeMinutes =
      //       distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;
      //   } else if (mapsService) {
      //     const travelTimeSec = await mapsService.getTravelTimeInSeconds({
      //       origin: { lat: driver.currentLat, lng: driver.currentLng },
      //       destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
      //     });
      //     estimatedTravelTimeMinutes = travelTimeSec
      //       ? travelTimeSec / 60
      //       : 9999;
      //   } else {
      //     throw new Error('No mapping service available');
      //   }
      // } catch (error) {
      //   if (error instanceof Error) {
      //     console.error(`Failed to get precise travel time: ${error.message}`);
      //   } else {
      //     console.error('Failed to get precise travel time:', error);
      //   }
      //   continue;
      // }
      // const estimatedTravelTimeMinutes =
      //   distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;
      const earliestPossibleArrivalAtPickup = driver.lastDropoffTime.plus({
        minutes: estimatedTravelTimeMinutes,
      });

      // Parse earliest into Luxon DateTime here as well for this second calculation block
      const earliestLuxon = DateTime.fromISO(
        typeof passenger.earliestPickupTime === 'string'
          ? passenger.earliestPickupTime
          : (passenger.earliestPickupTime as Date).toISOString(),
        { zone: 'America/New_York' }
      );

      // Ensure both arguments to DateTime.max are Luxon DateTimes
      const estimatedPickupTimeLuxon = DateTime.max(
        earliestPossibleArrivalAtPickup,
        earliestLuxon // <--- Changed from 'earliest' to 'earliestLuxon'
      );

      const estimatedDurationMinutes =
        Number(passenger.estimatedDurationMin) || 30;
      const estimatedDropoffTimeLuxon = estimatedPickupTimeLuxon.plus({
        minutes: estimatedDurationMinutes,
      });

      const isFirstTripForDriver =
        driver.lastDropoffTime.toISO() ===
        DateTime.fromJSDate(targetDate).setZone('America/New_York').toISO();

      let idleTimeMinutesForLogging = 0; // Initialize to 0

      // Only calculate idle time for subsequent trips
      if (!isFirstTripForDriver) {
        const driverDepartureTimeForThisTrip = estimatedPickupTimeLuxon.minus({
          minutes: estimatedTravelTimeMinutes,
        });

        if (driverDepartureTimeForThisTrip > driver.lastDropoffTime) {
          idleTimeMinutesForLogging = driverDepartureTimeForThisTrip.diff(
            driver.lastDropoffTime,
            'minutes'
          ).minutes;
        }
      }

      console.log(`[ASSIGNMENT_LOG] D${driver.id} to P${passenger.id}:`);
      console.log(`  - Scheduled Pickup: ${estimatedPickupTimeLuxon.toISO()}`);
      console.log(
        `  - Scheduled Dropoff: ${estimatedDropoffTimeLuxon.toISO()}`
      );
      console.log(
        `  - Travel Time (driving): ${estimatedTravelTimeMinutes.toFixed(2)} min`
      );
      console.log(`  - Driver Last Dropoff: ${driver.lastDropoffTime.toISO()}`);
      console.log(
        `  - Driver Idle Time (waiting between trips): ${idleTimeMinutesForLogging.toFixed(2)} min`
      );
      if (isFirstTripForDriver) {
        console.log(
          `  - This is driver's first trip of the day (idle time not applicable)`
        );
      }

      if (!assignmets.some((a) => a.passengerId === passenger.id)) {
        assignmets.push({
          driverId: driver.id,
          passengerId: passenger.id,
          estimatedPickupTime: estimatedPickupTimeLuxon.toJSDate(),
          estimatedDropoffTime: estimatedDropoffTimeLuxon.toJSDate(),
          status: AssignmentStatus.CONFIRMED,
        });
      }
      assignedPassengerIds.add(passenger.id);

      // Carpool logic
      const carpoolAssignments: Assignment[] = [];
      let lastDropoffTime = estimatedDropoffTimeLuxon;
      let lastDropoffLat = passenger.dropoffLat;
      let lastDropoffLng = passenger.dropoffLng;

      const potentialCarpoolPassengers = remainingPassengers.filter(
        (cp) => cp.id !== passenger.id && !assignedPassengerIds.has(cp.id)
      );
      if (potentialCarpoolPassengers.length > 0) {
        const carpoolOriginDriver = [
          {
            id: driver.id,
            currentLat: lastDropoffLat,
            currentLng: lastDropoffLng,
          },
        ];

        // Make a new batch call for carpool candidates from this updated origin
        const carpoolBatchResults = await getBatchTravelTimes(
          carpoolOriginDriver,
          potentialCarpoolPassengers // Pass all potential carpool passengers
        );

        for (const cp of potentialCarpoolPassengers) {
          if (cp.id === passenger.id) continue;
          if (assignedPassengerIds.has(cp.id)) continue;

          const cpPickup = { lat: cp.pickupLat, lng: cp.pickupLng };
          const routeStart = { lat: driver.currentLat, lng: driver.currentLng };
          const routeEnd = {
            lat: passenger.dropoffLat,
            lng: passenger.dropoffLng,
          };

          const distToRouteStart = USE_MOCK_MAPS
            ? calculateMockDistance(
                routeStart.lat,
                routeStart.lng,
                cpPickup.lat,
                cpPickup.lng
              )
            : haversineDistance(
                routeStart.lat,
                routeStart.lng,
                cpPickup.lat,
                cpPickup.lng
              );
          const isWithin1km = distToRouteStart <= 1;

          const cpEarliest = DateTime.fromISO(
            typeof cp.earliestPickupTime === 'string'
              ? cp.earliestPickupTime
              : (cp.earliestPickupTime as Date).toISOString(),
            { zone: 'America/New_York' }
          );
          const cpLatest = DateTime.fromISO(
            typeof cp.latestPickupTime === 'string'
              ? cp.latestPickupTime
              : (cp.latestPickupTime as Date).toISOString(),
            { zone: 'America/New_York' }
          );

          const isPickupWithin10MinWindow =
            cpEarliest.diff(estimatedPickupTimeLuxon, 'minutes').minutes <= 10;

          const mainVec = {
            x: routeEnd.lat - routeStart.lat,
            y: routeEnd.lng - routeStart.lng,
          };
          const cpVec = {
            x: cpPickup.lat - routeStart.lat,
            y: cpPickup.lng - routeStart.lng,
          };
          const dotProduct = mainVec.x * cpVec.x + mainVec.y * cpVec.y;
          const directionAligned = dotProduct > 0;
          const cpTravelTime =
            carpoolBatchResults.get(driver.id)?.get(cp.id) ?? 9999;

          if (cpTravelTime === 9999) {
            console.warn(`No valid travel time for carpool passenger ${cp.id}`);
            continue; // Skip this carpool assignment
          }
          const cpPickupTime = estimatedPickupTimeLuxon.plus({
            minutes: cpTravelTime,
          });
          const isWithinTimeWindow =
            cpPickupTime >= cpEarliest && cpPickupTime <= cpLatest;

          if (
            isWithin1km &&
            isPickupWithin10MinWindow &&
            isWithinTimeWindow &&
            directionAligned
          ) {
            console.log(
              `[CARPOOL] Driver ${driver.id} picking up carpool rider ${cp.id}`
            );

            // const cpTravelTime = await getTravelTime(
            //   routeStart.lat,
            //   routeStart.lng,
            //   cpPickup.lat,
            //   cpPickup.lng
            // );
            // const cpTravelTime =
            //   cpDistance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;
            const totalTripMinutes =
              cpTravelTime + (Number(cp.estimatedDurationMin) || 30);

            const cpDropoffTime = cpPickupTime.plus({
              minutes: totalTripMinutes,
            });

            if (!assignmets.some((a) => a.passengerId === cp.id)) {
              carpoolAssignments.push({
                driverId: driver.id,
                passengerId: cp.id,
                estimatedPickupTime: cpPickupTime.toJSDate(),
                estimatedDropoffTime: cpDropoffTime.toJSDate(),
                status: AssignmentStatus.CONFIRMED,
              });
            }
            assignedPassengerIds.add(cp.id);

            // update last dropoff only
            lastDropoffTime = cpDropoffTime;
            lastDropoffLat = cp.dropoffLat;
            lastDropoffLng = cp.dropoffLng;
          }
        }
      }

      // Apply carpool assignments
      assignmets.push(...carpoolAssignments);

      // Finally update driver position and time to latest one
      driver.lastDropoffTime = lastDropoffTime;
      driver.currentLat = lastDropoffLat;
      driver.currentLng = lastDropoffLng;
      driversAssignedInThisCycle.add(driverId);
    }
    for (let i = remainingPassengers.length - 1; i >= 0; i--) {
      if (assignedPassengerIds.has(remainingPassengers[i].id)) {
        remainingPassengers.splice(i, 1);
      }
    }
  }

  // --- Fallback starts here ---
  let fallbackActivated = false;
  if (!fallbackActivated && remainingPassengers.length > 0) {
    console.log(
      `[FALLBACK] Retrying ${remainingPassengers.length} unassigned passenger(s) using global fallback (ignoring idle time)`
    );
    fallbackActivated = true;

    // Step 1: Build relaxed costMatrix
    const fallbackBatchResults = await getBatchTravelTimes(
      driverStates,
      remainingPassengers
    );

    const fallbackMatrix = driverStates.map((driver) =>
      remainingPassengers.map((passenger) => {
        const estimatedTravelTimeMinutes =
          fallbackBatchResults.get(driver.id)?.get(passenger.id) ?? 999;
        // const travelMinutes = distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;

        const earliest = DateTime.fromISO(
          typeof passenger.earliestPickupTime === 'string'
            ? passenger.earliestPickupTime
            : (passenger.earliestPickupTime as Date).toISOString(),
          { zone: 'America/New_York' }
        );
        const latest = DateTime.fromISO(
          typeof passenger.latestPickupTime === 'string'
            ? passenger.latestPickupTime
            : (passenger.latestPickupTime as Date).toISOString(),
          { zone: 'America/New_York' }
        );

        if (!earliest.isValid || !latest.isValid) return 9999;

        const arrival = driver.lastDropoffTime.plus({
          minutes: estimatedTravelTimeMinutes,
        });
        const pickupTime = DateTime.max(arrival, earliest);

        const withinWindow = pickupTime >= earliest && pickupTime <= latest;

        return withinWindow ? estimatedTravelTimeMinutes : 9999;
      })
    );

    // Step 2: Apply Hungarian Algorithm
    const resolvedFallbackMatrix: number[][] = await Promise.all(
      fallbackMatrix.map((row) => Promise.all(row))
    );
    const fallbackAssignments = hungarianAlgorithm(resolvedFallbackMatrix);
    console.log('[FALLBACK DEBUG] Cost Matrix:', resolvedFallbackMatrix);
    console.log('[FALLBACK DEBUG] Assignments:', fallbackAssignments);

    let fallbackAssignedCount = 0;

    // Step 3: Apply fallback assignments
    for (const [driverIdx, passengerIdx] of fallbackAssignments) {
      const driver = driverStates[driverIdx];
      const passenger = remainingPassengers[passengerIdx];

      const alreadyAssigned = assignedPassengerIds.has(passenger.id);
      if (!driver || !passenger || alreadyAssigned) continue;

      const estimatedTravelTimeMinutes =
        fallbackBatchResults.get(driver.id)?.get(passenger.id) ?? 9999;
      // const travelMinutes = distance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;
      if (estimatedTravelTimeMinutes === 9999) continue;

      const earliest = DateTime.fromISO(
        typeof passenger.earliestPickupTime === 'string'
          ? passenger.earliestPickupTime
          : (passenger.earliestPickupTime as Date).toISOString(),
        { zone: 'America/New_York' }
      );
      const arrival = driver.lastDropoffTime.plus({
        minutes: estimatedTravelTimeMinutes,
      });
      const pickupTime = DateTime.max(arrival, earliest);
      const dropoffTime = pickupTime.plus({
        minutes: Number(passenger.estimatedDurationMin) || 30,
      });

      assignmets.push({
        driverId: driver.id,
        passengerId: passenger.id,
        estimatedPickupTime: pickupTime.toJSDate(),
        estimatedDropoffTime: dropoffTime.toJSDate(),
        status: AssignmentStatus.CONFIRMED,
      });

      console.log(
        `[FALLBACK_ASSIGN] Driver ${driver.id} → Passenger ${passenger.id}`
      );

      // Update driver state and tracking
      driver.lastDropoffTime = dropoffTime;
      driver.currentLat = passenger.dropoffLat;
      driver.currentLng = passenger.dropoffLng;
      assignedPassengerIds.add(passenger.id);
      fallbackAssignedCount++;
    }

    console.log(
      `[FALLBACK] Assigned ${fallbackAssignedCount} additional passenger(s) using global fallback.`
    );
  }

  return assignmets;
}

export async function runAssignmentCycle(cycleDate?: Date): Promise<void> {
  console.log(`[ASSIGNMENT] Starting basic assignment cycle...`);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = cycleDate || tomorrow;
  const [drivers, passengers] = await Promise.all([
    prisma.driver.findMany({ where: { status: 'IDLE' } }),
    prisma.passenger.findMany({ where: { status: 'UNASSIGNED' } }),
  ]);

  if (drivers.length === 0 || passengers.length === 0) {
    console.log(
      '[ASSIGNMENT] No idle drivers or unassigned passengers available.'
    );
    return;
  }
  console.log('[DEBUG] Calling assignPassengersToDrivers...');

  let assignments: Assignment[] = [];

  try {
    assignments = await assignPassengersToDrivers(
      drivers,
      passengers,
      targetDate
    );
    console.log('[DEBUG] Received assignments:', assignments.length);
  } catch (err) {
    console.error('[ERROR] Failed to assign passengers to drivers:', err);
    return;
  }

  if (assignments.length === 0) {
    console.log('[ASSIGNMENT] No viable assignments found.');
    return;
  }

  const assignedDriverIds = assignments.map((a) => a.driverId);
  const assignedPassengerIds = assignments.map((a) => a.passengerId);


  const passengerMap = new Map(
    (
      await prisma.passenger.findMany({
        where: { id: { in: assignedPassengerIds } },
        select: { id: true, dropoffLat: true, dropoffLng: true },
      })
    ).map((p) => [p.id, p])
  );

  const driverUpdates = new Map<string, { lastDropoffLat: number; lastDropoffLng: number; lastDropoffTimestamp: Date }>();
  for (const assignment of assignments) {
    const passenger = passengerMap.get(assignment.passengerId);
    if (passenger) {
      driverUpdates.set(assignment.driverId, {
        lastDropoffLat: passenger.dropoffLat,
        lastDropoffLng: passenger.dropoffLng,
        lastDropoffTimestamp: assignment.estimatedDropoffTime,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    // Update driver statuses and dropoff data
    for (const [driverId, update] of driverUpdates) {
      await tx.driver.update({
        where: { id: driverId },
        data: {
          status: 'EN_ROUTE_TO_PICKUP',
          lastDropoffLat: update.lastDropoffLat,
          lastDropoffLng: update.lastDropoffLng,
          lastDropoffTimestamp: update.lastDropoffTimestamp,
        },
      });
    }

    await tx.passenger.updateMany({
      where: { id: { in: assignedPassengerIds } },
      data: { status: 'ASSIGNED' },
    });

    // Create assignments
    for (const a of assignments) {
      await tx.assignment.create({ data: a });
    }
  });

  const [updatedDrivers, updatedPassengers] = await Promise.all([
    prisma.driver.findMany({ where: { id: { in: assignedDriverIds } } }),
    prisma.passenger.findMany({ where: { id: { in: assignedPassengerIds } } }),
  ]);

  const assignedDriverCount = updatedDrivers.filter(
    (d) => d.status === 'EN_ROUTE_TO_PICKUP'
  ).length;
  const assignedPassengerCount = updatedPassengers.filter(
    (p) => p.status === 'ASSIGNED'
  ).length;

  console.log(
    `[ASSIGNMENT] Assigned ${assignedPassengerCount} passenger(s) to ${assignedDriverCount} driver(s).`
  );


  //update driver status
  // await prisma.driver.updateMany({
  //   where: { id: { in: assignedDriverIds } },
  //   data: {
  //     status: 'EN_ROUTE_TO_PICKUP',
  //   },
  // });

  // await prisma.passenger.updateMany({
  //   where: { id: { in: assignedPassengerIds } },
  //   data: {
  //     status: 'ASSIGNED',
  //   },
  // });

  // // saving  to DB using transaction
  // await prisma.$transaction(async (tx) => {
  //   for (const a of assignments) {
  //     await tx.assignment.create({ data: a });
  //   }
  // });

  // //for the log
  // const [updatedDrivers, updatedPassengers] = await Promise.all([
  //   prisma.driver.findMany({ where: { id: { in: assignedDriverIds } } }),
  //   prisma.passenger.findMany({ where: { id: { in: assignedPassengerIds } } }),
  // ]);

  // const assignedDriverDriver = updatedDrivers.filter(
  //   (d) => d.status === 'EN_ROUTE_TO_PICKUP'
  // ).length;
  // const assignedPassenger = updatedPassengers.filter(
  //   (p) => p.status === 'ASSIGNED'
  // ).length;

  // console.log(
  //   `[ASSIGNMENT] Assigned ${assignedPassenger} passenger(s) to ${assignedDriverDriver} driver(s).`
  // );
  //for the log
}
