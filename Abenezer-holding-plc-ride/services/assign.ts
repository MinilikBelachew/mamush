import {
  Driver,
  Passenger,
  Prisma,
  Assignment,
  PassengerStatus,
  DriverStatus,
  AssignmentStatus,
  Trip,
} from '@prisma/client';
import { driverService } from './driver';
import { passengerService } from './passengers';
import { GoogleMapsService } from './googleMap';
import { MockGoogleMapsService } from './googleMap.mock';
import { prisma } from '@utils/prisma';
import { isLocationNearPolyline } from '@utils/helpers';
import {
  printAdvancedReport,
  validateAdvancedAssignments,
} from 'validator/assignmentValidator';

interface ScoredPassengerMatch {
  passenger: Passenger;
  driver: Driver;
  score: number;
  travelTimeToPickupSeconds: number;
  estimatedPickupTime: Date;
  passengerRideDurationSeconds: number;
}

export class AssignmentService {
  private ds = driverService;
  private ps = passengerService;
  private gms: GoogleMapsService | MockGoogleMapsService;

  constructor() {
    if (process.env.USE_MOCK_MAPS === 'true') {
      this.gms = new MockGoogleMapsService();
    } else {
      this.gms = new GoogleMapsService();
    }
  }

  /**

   * @param passengerEarliestTime - Original earliest pickup time from passenger
   * @param passengerLatestTime - Original latest pickup time from passenger  
   * @param targetDate - The date to schedule for (e.g., tomorrow)
   * @returns Object with earliest and latest pickup times mapped to target date
   */
  private mapPickupTimesToTargetDate(
    passengerEarliestTime: Date,
    passengerLatestTime: Date,
    targetDate: Date
  ): { earliestPickup: Date; latestPickup: Date } {
    // Construct earliest pickup on the target date using UTC
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

    // Construct latest pickup on the target date using UTC
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

    // If the latest is before the earliest, it means the window crosses midnight
    if (latestPickup.getTime() < earliestPickup.getTime()) {
      latestPickup.setUTCDate(latestPickup.getUTCDate() + 1);
    }

    return { earliestPickup, latestPickup };
  }

  /**

   * @param match - The matched driver-passenger pair with scoring details
   * @returns Promise<Assignment | null> - Created assignment or null if failed
   */
  private async assignBestMatch(
    match: ScoredPassengerMatch
  ): Promise<Assignment | null> {
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
    const wasIdle = true;

    try {
      // A transaction ensures that all steps succeed or none of them do.
      newAssignmentResult = await prisma.$transaction(async (tx) => {
        // --- ATOMIC UPDATE #1: Assign the passenger ONLY if they are still unassigned ---
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

        // If the count is 0, it means another process assigned this passenger first.
        if (updatedPassengerCount.count === 0) {
          console.log(
            `[RACE_CONDITION] Passenger ${passenger.id} was already assigned by another process. Aborting transaction.`
          );
          throw new Error('Passenger not available'); // This forces the transaction to roll back
        }

        // --- ATOMIC UPDATE #2: Assign the driver ONLY if they are still idle ---
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

        // If both updates succeeded, we can safely create the assignment
        const newAssignment = await tx.assignment.create({
          data: {
            driverId: driver.id,
            passengerId: passenger.id,
            estimatedPickupTime,
            estimatedDropoffTime,
            status: AssignmentStatus.CONFIRMED,
          },
        });

        // Now link the new assignment to the driver
        await tx.driver.update({
          where: { id: driver.id },
          data: { currentAssignmentId: newAssignment.id },
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

    // If the assignment was successful, kick off the carpool search.
    if (newAssignmentResult && wasIdle) {
      console.log(
        `--- Kicking off carpool search for assignment: ${newAssignmentResult.id} ---`
      );
      this.findAndAddOnRoutePassenger(newAssignmentResult.id).catch((err) =>
        console.error(`[ENHANCE_ERROR] Error during trip enhancement: ${err}`)
      );
    }

    return newAssignmentResult;
  }

  /**
   * @param completedAssignmentId - ID of the assignment to complete
   * @param actualDropoffTime - Actual dropoff time (defaults to now)
   */
  public async completeAssignment(
    completedAssignmentId: string,
    actualDropoffTime: Date = new Date()
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const completedAssignment = await tx.assignment.findUnique({
        where: { id: completedAssignmentId },
      });
      if (!completedAssignment) throw new Error('Assignment not found');
      const passenger = await tx.passenger.findUnique({
        where: { id: completedAssignment.passengerId },
      });
      if (!passenger) throw new Error('Passenger not found');
      await tx.assignment.update({
        where: { id: completedAssignmentId },
        data: {
          status: AssignmentStatus.COMPLETED,
          actualDropoffTime,
        },
      });
      await tx.passenger.update({
        where: { id: passenger.id },
        data: { status: PassengerStatus.DROPPED_OFF },
      });
      const driver = await tx.driver.findUnique({
        where: { id: completedAssignment.driverId },
      });
      if (!driver) throw new Error('Driver not found');
      const updateData: Prisma.DriverUpdateInput = {
        lastDropoffTimestamp: actualDropoffTime,
        lastDropoffLat: passenger.dropoffLat,
        lastDropoffLng: passenger.dropoffLng,
      };
      if (completedAssignment.nextAssignmentId) {
        updateData.status = DriverStatus.EN_ROUTE_TO_PICKUP;
        updateData.currentAssignmentId = completedAssignment.nextAssignmentId;
      } else {
        updateData.status = DriverStatus.IDLE;
        updateData.currentAssignmentId = null;
      }
      await tx.driver.update({ where: { id: driver.id }, data: updateData });
    });
  }

  private async createSharedTrip(
    initialAssignment: Assignment & { passenger: Passenger; driver: Driver },
    passengerB: Passenger,
    optimizedRoute: any
  ): Promise<Trip | null> {
    const { driver, passenger: passengerA } = initialAssignment;

    const waypointsForAPI = [
      {
        id: `${passengerA.id}-pickup`,
        type: 'PICKUP' as const,
        passengerId: passengerA.id,
        lat: passengerA.pickupLat,
        lng: passengerA.pickupLng,
      },
      {
        id: `${passengerB.id}-pickup`,
        type: 'PICKUP' as const,
        passengerId: passengerB.id,
        lat: passengerB.pickupLat,
        lng: passengerB.pickupLng,
      },
      {
        id: `${passengerB.id}-dropoff`,
        type: 'DROPOFF' as const,
        passengerId: passengerB.id,
        lat: passengerB.dropoffLat,
        lng: passengerB.dropoffLng,
      },
      {
        id: `${passengerA.id}-dropoff`,
        type: 'DROPOFF' as const,
        passengerId: passengerA.id,
        lat: passengerA.dropoffLat,
        lng: passengerA.dropoffLng,
      },
    ];

    const { finalStopOrder, stopEtas } = this._parseGoogleRoute(
      new Date(
        Math.max(
          Date.now(),
          new Date(passengerA.earliestPickupTime ?? Date.now()).getTime()
        )
      ),
      {
        lat: driver.currentLat!,
        lng: driver.currentLng!,
      },
      waypointsForAPI,
      optimizedRoute
    );

    try {
      return await prisma.$transaction(async (tx) => {
        const newTrip = await tx.trip.create({
          data: {
            driverId: driver.id,
            status: 'ACTIVE',
            orderedWaypointsJson: JSON.stringify(finalStopOrder),
          },
        });

        // Update assignment A (existing one)
        await tx.assignment.update({
          where: { id: initialAssignment.id },
          data: {
            tripId: newTrip.id,
            ...stopEtas[passengerA.id],
          },
        });

        // Create assignment B (new one)
        const passengerBTimes = stopEtas[passengerB.id];

        // ✅ FIXED: Ensure estimatedDropoffTime is always calculated
        // If route parsing didn't provide it, calculate it from pickup time + ride duration
        const finalPassengerBTimes = { ...passengerBTimes };
        if (
          finalPassengerBTimes.estimatedPickupTime &&
          !finalPassengerBTimes.estimatedDropoffTime
        ) {
          const rideDurationSeconds =
            (passengerB.estimatedDurationMin || 20) * 60;
          finalPassengerBTimes.estimatedDropoffTime = new Date(
            finalPassengerBTimes.estimatedPickupTime.getTime() +
              rideDurationSeconds * 1000
          );
          console.log(
            `[CREATE_SHARED_TRIP] Calculated missing estimatedDropoffTime for passenger ${passengerB.id}: ${finalPassengerBTimes.estimatedDropoffTime.toISOString()}`
          );
        }

        await tx.assignment.create({
          data: {
            driverId: driver.id,
            passengerId: passengerB.id,
            status: 'CONFIRMED',
            tripId: newTrip.id,
            ...finalPassengerBTimes,
          },
        });

        // Link trip to driver
        await tx.driver.update({
          where: { id: driver.id },
          data: {
            currentTripId: newTrip.id,
            currentAssignmentId: null,
          },
        });

        // Update passenger B's state
        await tx.passenger.update({
          where: { id: passengerB.id },
          data: {
            status: PassengerStatus.ASSIGNED,
            assignedDriverId: driver.id,
          },
        });

        return newTrip;
      });
    } catch (error) {
      console.error('Error creating shared trip:', error);
      return null;
    }
  }

  public async findAndAddOnRoutePassenger(
    initialAssignmentId: string
  ): Promise<void> {
    const DETOUR_LIMIT_SECONDS = 10 * 60; // 10 minutes
    const SEARCH_RADIUS_METERS = 800;

    console.log(
      `[ENHANCE] Starting search for on-route passengers for initial assignment ${initialAssignmentId}`
    );
    const initialAssignment = await prisma.assignment.findUnique({
      where: { id: initialAssignmentId },
      include: { passenger: true, driver: true },
    });

    if (
      !initialAssignment?.driver?.currentLat ||
      !initialAssignment.passenger
    ) {
      console.error(
        `[ENHANCE] Initial assignment ${initialAssignmentId} is missing required data.`
      );
      return;
    }

    const { driver, passenger: passengerA } = initialAssignment;

    const initialRouteRequest = {
      origin: { lat: driver.currentLat, lng: driver.currentLng },
      destination: { lat: passengerA.dropoffLat, lng: passengerA.dropoffLng },
      waypoints: [{ lat: passengerA.pickupLat, lng: passengerA.pickupLng }],
      mode: 'driving' as const,
    };

    const initialRoute = await this.gms.getDirections(initialRouteRequest);
    if (!initialRoute?.routes?.[0]?.legs?.[0]) {
      console.error(
        `[ENHANCE] Google Maps could not generate an initial route for assignment ${initialAssignmentId}. Aborting search.`
      );
      return;
    }

    const initialRouteData = initialRoute.routes[0];
    const initialDurationSeconds = initialRouteData.legs.reduce(
      (total: any, leg: any) => total + (leg.duration?.value || 0),
      0
    );
    const routePolyline = initialRouteData.overview_polyline.points;

    const unassignedPassengers = await this.ps.getUnassignedPassengers();
    const candidatePassengers = unassignedPassengers.filter((p) => {
      if (p.id === passengerA.id) return false;
      return isLocationNearPolyline(
        { lat: p.pickupLat, lng: p.pickupLng },
        routePolyline,
        SEARCH_RADIUS_METERS
      );
    });

    if (candidatePassengers.length === 0) {
      console.log(
        `[ENHANCE] No nearby passengers found for assignment ${initialAssignment.id}`
      );
      return;
    }

    for (const passengerB of candidatePassengers) {
      if (passengerA.groupSize + passengerB.groupSize > driver.capacity)
        continue;

      const sharedRouteRequest = {
        origin: initialRouteRequest.origin,
        destination: initialRouteRequest.destination,
        waypoints: [
          { lat: passengerA.pickupLat, lng: passengerA.pickupLng },
          { lat: passengerB.pickupLat, lng: passengerB.pickupLng },
          { lat: passengerA.dropoffLat, lng: passengerA.dropoffLng },
          { lat: passengerB.dropoffLat, lng: passengerB.dropoffLng },
        ],
        optimizeWaypoints: false,
        mode: 'driving' as const,
      };

      const sharedRoute = await this.gms.getDirections(sharedRouteRequest);
      if (!sharedRoute?.routes?.[0]?.legs) continue;

      const sharedRouteData = sharedRoute.routes[0];
      const sharedDurationSeconds = sharedRouteData.legs.reduce(
        (total: any, leg: any) => total + (leg.duration?.value || 0),
        0
      );
      const detourSeconds = sharedDurationSeconds - initialDurationSeconds;

      if (detourSeconds < DETOUR_LIMIT_SECONDS) {
        console.log(
          `[ENHANCE] Found a match! Adding P-${
            passengerB.id
          }. Detour: ${Math.round(detourSeconds / 60)}m`
        );

        const newTrip = await this.createSharedTrip(
          initialAssignment,
          passengerB,
          sharedRouteData
        );

        if (newTrip) {
          // After creating the 2-person trip, immediately try to enhance it again for a 3rd person.
          console.log(
            `[ENHANCE] Re-running enhancement for new multi-stop trip ${newTrip.id}`
          );
          await this.enhanceExistingTrip(newTrip.id);
        }
        break;
      }
    }
  }

  public async enhanceExistingTrip(tripId: string): Promise<void> {
    const DETOUR_LIMIT_SECONDS = 10 * 60;
    const SEARCH_RADIUS_METERS = 800;

    console.log(
      `[ENHANCE RECURSIVE] Checking for 3rd+ passenger for trip ${tripId}`
    );

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { driver: true, assignments: { include: { passenger: true } } },
    });

    if (!trip?.driver?.currentLat || trip.assignments.length < 2) {
      console.log(
        `[ENHANCE RECURSIVE] Trip ${tripId} not eligible for further enhancement.`
      );
      return;
    }

    const currentPassengersOnTrip = trip.assignments.map((a) => a.passenger);
    const currentPassengerIds = currentPassengersOnTrip.map((p) => p.id);
    const currentGroupSize = currentPassengersOnTrip.reduce(
      (sum, p) => sum + p.groupSize,
      0
    );

    const orderedStops: any[] = JSON.parse(trip.orderedWaypointsJson || '[]');
    if (orderedStops.length < 1) return;

    // ✅ Clear naming for the last stop
    const lastWaypoint = orderedStops[orderedStops.length - 1];
    const currentWaypoints = orderedStops.slice(0, -1);

    const origin = {
      lat: lastWaypoint.lat,
      lng: lastWaypoint.lng,
    };

    const currentRoute = await this.gms.getDirections({
      origin,
      destination: {
        lat: lastWaypoint.lat,
        lng: lastWaypoint.lng,
      },
      waypoints: currentWaypoints.map((wp: any) => ({
        lat: wp.lat,
        lng: wp.lng,
      })),
      mode: 'driving' as const,
    });

    if (!currentRoute?.routes?.[0]?.legs) {
      console.error(
        `[ENHANCE RECURSIVE] Could not generate route for existing trip ${tripId}.`
      );
      return;
    }

    const currentRouteData = currentRoute.routes[0];
    const currentDurationSeconds = currentRouteData.legs.reduce(
      (total: any, leg: any) => total + (leg.duration?.value || 0),
      0
    );
    const routePolyline = currentRouteData.overview_polyline.points;

    const candidatePassengers = (
      await this.ps.getUnassignedPassengers()
    ).filter(
      (p) =>
        !currentPassengerIds.includes(p.id) &&
        isLocationNearPolyline(
          { lat: p.pickupLat, lng: p.pickupLng },
          routePolyline,
          SEARCH_RADIUS_METERS
        )
    );

    if (candidatePassengers.length === 0) {
      console.log(
        `[ENHANCE RECURSIVE] No further nearby passengers found for trip ${tripId}.`
      );
      return;
    }

    for (const passengerC of candidatePassengers) {
      if (currentGroupSize + passengerC.groupSize > trip.driver.capacity)
        continue;

      const newWaypointsForAPI = [
        ...currentWaypoints,
        lastWaypoint,
        {
          type: 'PICKUP',
          passengerId: passengerC.id,
          lat: passengerC.pickupLat,
          lng: passengerC.pickupLng,
        },
        {
          type: 'DROPOFF',
          passengerId: passengerC.id,
          lat: passengerC.dropoffLat,
          lng: passengerC.dropoffLng,
        },
      ];

      const newDestinationForAPI = newWaypointsForAPI.pop();

      const newSharedRoute = await this.gms.getDirections({
        origin,
        destination: {
          lat: newDestinationForAPI.lat,
          lng: newDestinationForAPI.lng,
        },
        waypoints: newWaypointsForAPI.map((wp) => ({
          lat: wp.lat,
          lng: wp.lng,
        })),
        optimizeWaypoints: true,
        mode: 'driving' as const,
      });

      if (!newSharedRoute?.routes?.[0]?.legs) continue;

      const newSharedRouteData = newSharedRoute.routes[0];
      const newSharedDurationSeconds = newSharedRouteData.legs.reduce(
        (total: any, leg: any) => total + (leg.duration?.value || 0),
        0
      );
      const detourSeconds = newSharedDurationSeconds - currentDurationSeconds;

      if (detourSeconds < DETOUR_LIMIT_SECONDS) {
        console.log(
          `[ENHANCE RECURSIVE] Found a 3rd+ passenger! Adding P-${passengerC.id}.`
        );

        const updatedTrip = await this.addPassengerToTrip(
          trip.id,
          passengerC,
          newSharedRouteData
        );

        if (updatedTrip) {
          await this.enhanceExistingTrip(updatedTrip.id);
        }
        return;
      }
    }
  }

  private _parseGoogleRoute(
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
      };
    } = {};

    const optimizedWaypoints = optimizedRoute.waypoint_order.map(
      (i: number) => waypointsForAPI[i]
    );

    const lastLeg = optimizedRoute.legs[optimizedRoute.legs.length - 1];

    // Prefer a dropoff that matches the end location
    let destinationStop = waypointsForAPI.find((wp) => {
      const isClose =
        Math.abs(wp.lat - lastLeg.end_location.lat) < 0.0001 &&
        Math.abs(wp.lng - lastLeg.end_location.lng) < 0.0001;
      return isClose && wp.type === 'DROPOFF';
    });

    // Fallback 1: try last optimized waypoint if it is a DROPOFF
    if (!destinationStop) {
      const lastOptimized = optimizedWaypoints[optimizedWaypoints.length - 1];
      if (lastOptimized.type === 'DROPOFF') {
        destinationStop = lastOptimized;
      }
    }

    // Fallback 2: just use last leg endpoint
    if (!destinationStop) {
      destinationStop = {
        id: 'generated-endpoint',
        lat: lastLeg.end_location.lat,
        lng: lastLeg.end_location.lng,
        type: 'DROPOFF',
        passengerId: 'generated',
      };
    }

    const finalStopOrder = [...optimizedWaypoints, destinationStop];

    // ✅ FIXED: Correctly map legs to stops
    // Each leg corresponds to travel TO the next stop, so leg i corresponds to stop i+1
    let cumulativeSeconds = 0;

    optimizedRoute.legs.forEach((leg: any, legIndex: number) => {
      cumulativeSeconds += leg.duration.value;
      const arrivalTime = new Date(
        departureTime.getTime() + cumulativeSeconds * 1000
      );

      // ✅ FIXED: Correct mapping - leg i corresponds to arrival at stop i+1
      const stopInfo = finalStopOrder[legIndex + 1]; // +1 because leg 0 = travel to stop 1
      if (!stopInfo?.passengerId || stopInfo.passengerId === 'generated')
        return;

      const passengerId = stopInfo.passengerId;
      if (!stopEtas[passengerId]) stopEtas[passengerId] = {};

      if (stopInfo.type === 'PICKUP') {
        stopEtas[passengerId].estimatedPickupTime = arrivalTime;
      } else if (stopInfo.type === 'DROPOFF') {
        stopEtas[passengerId].estimatedDropoffTime = arrivalTime;
      }
    });

    // ✅ ADDED: Validation to ensure pickup comes before dropoff
    for (const passengerId in stopEtas) {
      const times = stopEtas[passengerId];
      if (times.estimatedPickupTime && times.estimatedDropoffTime) {
        if (
          times.estimatedDropoffTime.getTime() <=
          times.estimatedPickupTime.getTime()
        ) {
          console.error(
            `[ROUTE_PARSE_ERROR] Invalid times for passenger ${passengerId}: pickup ${times.estimatedPickupTime.toISOString()}, dropoff ${times.estimatedDropoffTime.toISOString()}`
          );
          // Fix by adding minimum ride duration (2 minutes)
          times.estimatedDropoffTime = new Date(
            times.estimatedPickupTime.getTime() + 2 * 60 * 1000
          );
        }
      }
    }

    return { finalStopOrder, stopEtas };
  }

  private async addPassengerToTrip(
    tripId: string,
    newPassenger: Passenger,
    optimizedRoute: any
  ): Promise<Trip | null> {
    // ✅ FIXED: Use passenger's earliest pickup time instead of Date.now()
    const departureTime = new Date(
      Math.max(
        new Date(newPassenger.earliestPickupTime ?? Date.now()).getTime(),
        Date.now()
      )
    );
    console.log(
      `[ADD_PASSENGER] Adding P-${newPassenger.id} to Trip ${tripId}.`
    );

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
        ...existingTrip.assignments.flatMap((a) => [
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

      // Parse existing stops (for future enhancement)
      // const originalStops = JSON.parse(existingTrip.orderedWaypointsJson!);
      // (originalDestination was previously computed but not used)

      const { finalStopOrder, stopEtas } = this._parseGoogleRoute(
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

        // ✅ FIXED: Ensure estimatedDropoffTime is always calculated
        // If route parsing didn't provide it, calculate it from pickup time + ride duration
        const finalTimes = { ...newPassengerTimes };
        if (
          finalTimes.estimatedPickupTime &&
          !finalTimes.estimatedDropoffTime
        ) {
          const rideDurationSeconds =
            (newPassenger.estimatedDurationMin || 20) * 60;
          finalTimes.estimatedDropoffTime = new Date(
            finalTimes.estimatedPickupTime.getTime() +
              rideDurationSeconds * 1000
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
            status: PassengerStatus.ASSIGNED,
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

  public async confirmPickup(
    assignmentId: string,
    actualPickupTimestamp: Date
  ): Promise<void> {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found.`);
    }

    // Use a transaction to ensure both updates succeed or fail together
    await prisma.$transaction([
      prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'IN_PROGRESS',
          // Use the accurate timestamp from the driver's app
          actualPickupTime: actualPickupTimestamp,
        },
      }),
      prisma.driver.update({
        where: { id: assignment.driverId },
        data: { status: 'EN_ROUTE_TO_DROPOFF' },
      }),
    ]);

    console.log(
      `Driver ${
        assignment.driverId
      } confirmed pickup for assignment ${assignmentId} at ${actualPickupTimestamp.toLocaleTimeString()}`
    );

    // Now that the first passenger is confirmed to be in the car,
    // we can search for on-route passengers to add to the trip.
    this.findAndAddOnRoutePassenger(assignmentId).catch((err) =>
      console.error(`[ENHANCE_ERROR] Error during trip enhancement: ${err}`)
    );
  }

  public async completeTrip(tripId: string): Promise<void> {
    console.log(
      `[CHAINING] Trip ${tripId} completed. Searching for next ride...`
    );

    // 1. Finalize the completed trip in the database
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

    // 2. Immediately search for the best *next* unassigned passenger
    const unassignedPassengers = await this.ps.getUnassignedPassengers();
    if (unassignedPassengers.length === 0) {
      console.log(
        `[CHAINING] No unassigned passengers. Setting driver ${driver.id} to IDLE.`
      );
      await this.ds.updateDriverStatus(driver.id, 'IDLE');
      return;
    }

    // 3. Find the best chained ride using a quick Distance Matrix call
    const matrix = await this.gms.getDistanceMatrix({
      origins: [lastDropoffLocation],
      destinations: unassignedPassengers.map((p) => ({
        lat: p.pickupLat,
        lng: p.pickupLng,
      })),
    });

    if (!matrix?.[0]) {
      console.log(
        `[CHAINING] Could not get travel times. Setting driver ${driver.id} to IDLE.`
      );
      await this.ds.updateDriverStatus(driver.id, 'IDLE');
      return;
    }

    let bestChainedRide: {
      score: number;
      passenger: Passenger | null;
      travelInfo: any;
    } = { score: Infinity, passenger: null, travelInfo: null };
    const MAX_CHAIN_PICKUP_SECONDS = 15 * 60; // Don't chain a ride that's more than 15 mins away

    matrix[0].forEach((element: any, index: number) => {
      if (
        element.status === 'OK' &&
        element.duration.value < MAX_CHAIN_PICKUP_SECONDS
      ) {
        // A simple score: the time to get to the next passenger. Lower is better.
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

    // 4. Assign the chained ride or set the driver to IDLE
    if (bestChainedRide.passenger) {
      console.log(
        `[CHAINING] Found next ride for driver ${driver.id}: P-${bestChainedRide.passenger.id}`
      );
      const rideDuration =
        (bestChainedRide.passenger.estimatedDurationMin || 30) * 60;

      // Calculate when the driver will actually be available to start traveling
      // Use the driver's last dropoff timestamp as the base time
      const driverAvailableTime = driver.lastDropoffTimestamp || new Date();

      await this.assignBestMatch({
        passenger: bestChainedRide.passenger,
        driver: driver,
        score: bestChainedRide.score + rideDuration,
        travelTimeToPickupSeconds: bestChainedRide.travelInfo.duration.value,
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
      await this.ds.updateDriverStatus(driver.id, 'IDLE');
    }
  }

  /**
   * Main assignment cycle that orchestrates the complete assignment process.
   * Runs in three phases:
   * 1. Initial Schedule: Creates chained single rides using Hungarian algorithm
   * 2. Route Enhancement: Adds carpool opportunities to existing trips
   * 3. Fallback Assignment: Handles remaining passengers with robust checks
   * 
   * This method is designed to be crash-resistant and handle race conditions.
   * 
   * @param cycleDate - Target date for scheduling (defaults to tomorrow)
   */
  public async runAssignmentCycle(cycleDate?: Date): Promise<void> {
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
    const [activeDrivers, unassignedPassengers] = await Promise.all([
      this.ds.getActiveDrivers(),
      this.ps.getUnassignedPassengers(),
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
    console.log('[PLANNER] Phase 1.5: Detecting potential carpool opportunities...');
    const carpoolGroups = this.detectCarpoolOpportunities(unassignedPassengers);
    console.log(`[PLANNER] Found ${carpoolGroups.length} potential carpool groups`);
    carpoolGroups.forEach((group, index) => {
      console.log(`[CARPOOL_${index + 1}] ${group.primaryPassenger.id} + ${group.secondaryPassenger.id}`);
      console.log(`  Distance: ${group.distance.toFixed(2)}km, Time Gap: ${group.timeGap.toFixed(1)}min, Direction Score: ${(group.directionScore * 100).toFixed(1)}%`);
    });
    const carpoolPassengers = carpoolGroups.map(group => ({
      ...group.primaryPassenger,
      id: `CARPOOL_${group.primaryPassenger.id}_${group.secondaryPassenger.id}`,
      groupSize: group.primaryPassenger.groupSize + group.secondaryPassenger.groupSize,
      carpoolGroup: group,
      carpoolOverlapEarliest: group.overlapEarliest,
      carpoolOverlapLatest: group.overlapLatest,
    }));
    const carpooledPassengerIds = new Set();
    carpoolGroups.forEach(group => {
      carpooledPassengerIds.add(group.primaryPassenger.id);
      carpooledPassengerIds.add(group.secondaryPassenger.id);
    });
    const remainingPassengers = unassignedPassengers.filter(p => !carpooledPassengerIds.has(p.id));
    const allPassengersForAssignment = [...carpoolPassengers, ...remainingPassengers];
    console.log(`[PLANNER] After carpool detection: ${carpoolPassengers.length} carpool groups + ${remainingPassengers.length} individual passengers`);

    // =================================================================
    // --- PHASE 2: Build Driver States ---
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
        if (!driverWithDetails) {
          console.error(`[PLANNER] Could not find driver details for ${driver.id}`);
          return null;
        }
        // Determine driver's next available time and location
        let nextAvailableTime = new Date(targetDate);
        let nextAvailableLat = driverWithDetails.currentLat || 0;
        let nextAvailableLng = driverWithDetails.currentLng || 0;
        // Check if driver has a current assignment
        const currentAssignment = driverWithDetails.assignments[0];
        if (currentAssignment?.estimatedDropoffTime) {
          if (currentAssignment.estimatedDropoffTime > nextAvailableTime) {
            nextAvailableTime = new Date(currentAssignment.estimatedDropoffTime);
            nextAvailableLat = currentAssignment.passenger?.dropoffLat || nextAvailableLat;
            nextAvailableLng = currentAssignment.passenger?.dropoffLng || nextAvailableLng;
          }
        }
        // Check if driver has an active trip
        const lastTrip = driverWithDetails.trips[0];
        if (
          lastTrip?.assignments?.[lastTrip.assignments.length - 1]?.estimatedDropoffTime
        ) {
          const tripDropoff = lastTrip.assignments[lastTrip.assignments.length - 1].estimatedDropoffTime;
          if (tripDropoff && tripDropoff > nextAvailableTime) {
            nextAvailableTime = new Date(tripDropoff);
            // Use the last dropoff location from the trip
            const lastTripAssignment = lastTrip.assignments[lastTrip.assignments.length - 1];
            nextAvailableLat = lastTripAssignment.passenger?.dropoffLat || nextAvailableLat;
            nextAvailableLng = lastTripAssignment.passenger?.dropoffLng || nextAvailableLng;
          }
        }
        // Ensure nextAvailableTime is always a Date
        if (!nextAvailableTime) nextAvailableTime = new Date(targetDate);
        return {
            driver,
          nextAvailableTime,
          nextAvailableLat,
          nextAvailableLng,
          schedule: [] as Array<{
            passengerId: string;
            estimatedPickupTime: Date;
            estimatedDropoffTime: Date;
            passengerRideDurationSeconds: number;
            carpoolGroup?: any;
          }>,
        };
      })
    );
    const validDriversState = driversState.filter(ds => ds !== null);

    // =================================================================
    // --- PHASE 3: Single Mega-Batch API Call ---
    // =================================================================
    console.log('[PLANNER] Phase 3: Making single mega-batch API call for all driver-passenger combinations...');
    const origins = validDriversState.map((ds) => ({
      lat: ds!.nextAvailableLat,
      lng: ds!.nextAvailableLng,
      driverId: ds!.driver.id,
      nextAvailableTime: ds!.nextAvailableTime,
    }));
    const destinations = allPassengersForAssignment.map((p) => ({
      lat: p.pickupLat,
      lng: p.pickupLng,
      passengerId: p.id,
      passenger: p,
    }));
    const megaMatrix = await this.gms.getDistanceMatrix({
      origins,
      destinations,
      departure_time: Math.floor(targetDate.getTime() / 1000),
    });
    if (!megaMatrix || !Array.isArray(megaMatrix)) {
      console.error('[PLANNER] Failed to get distance matrix from Google Maps API');
      return;
    }
    console.log(`[PLANNER] Successfully received matrix: ${megaMatrix.length} drivers × ${megaMatrix[0]?.length || 0} passengers`);

    // =================================================================
    // --- PHASE 4: Minimize Drivers, Minimize Idle Time ---
    // =================================================================
    const assignmentsFromSchedule: any[] = [];
    const assignedPassengerIds = new Set<string>();
    // Sort passengers by earliest pickup time
    const passengersSorted = allPassengersForAssignment.slice().sort((a, b) => {
      let aTime: number = 0;
      if (a.earliestPickupTime instanceof Date) {
        aTime = a.earliestPickupTime.getTime();
      } else if (typeof a.earliestPickupTime === 'string' || typeof a.earliestPickupTime === 'number') {
        aTime = new Date(a.earliestPickupTime).getTime();
      }
      let bTime: number = 0;
      if (b.earliestPickupTime instanceof Date) {
        bTime = b.earliestPickupTime.getTime();
      } else if (typeof b.earliestPickupTime === 'string' || typeof b.earliestPickupTime === 'number') {
        bTime = new Date(b.earliestPickupTime).getTime();
      }
      return aTime - bTime;
    });
    // Track driver schedules
    const driverSchedules: Array<{
      driver: any,
      schedule: Array<{
        passengerId: string,
        estimatedPickupTime: Date,
        estimatedDropoffTime: Date,
        travelTimeToPickupSeconds: number,
        carpoolGroup?: any,
        pickupLat: number,
        pickupLng: number,
        dropoffLat: number,
        dropoffLng: number,
      }>,
      nextAvailableTime: Date,
      nextAvailableLat: number,
      nextAvailableLng: number,
      capacityLeft: number,
    }> = [];
    // Precompute all travel times for first assignments
    const travelMatrix = megaMatrix;
    for (const passenger of passengersSorted) {
      if (assignedPassengerIds.has(passenger.id)) continue;
      if (!passenger.earliestPickupTime || !passenger.latestPickupTime) continue;
      // If this is a carpool passenger, use the overlap window
      let effectiveEarliest = passenger.earliestPickupTime;
      let effectiveLatest = passenger.latestPickupTime;
      if ((passenger as any).carpoolOverlapEarliest && (passenger as any).carpoolOverlapLatest) {
        effectiveEarliest = (passenger as any).carpoolOverlapEarliest;
        effectiveLatest = (passenger as any).carpoolOverlapLatest;
        console.log(`[ASSIGN_CARPOOL] Carpool ${passenger.id}: Using overlap window ${effectiveEarliest.toISOString()} to ${effectiveLatest.toISOString()}`);
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
      // Try to chain to an existing driver
      for (let d = 0; d < driverSchedules.length; d++) {
        const ds = driverSchedules[d];
        if (ds.capacityLeft <= 0) continue;
        const prevDropoffTime = ds.nextAvailableTime;
        const prevDropoffLat = ds.nextAvailableLat;
        const prevDropoffLng = ds.nextAvailableLng;
        const travelTimeToPickupSeconds = await this.gms.getTravelTimeInSeconds({
          origin: { lat: prevDropoffLat, lng: prevDropoffLng },
          destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
          departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
        });
        if (travelTimeToPickupSeconds === null) {
          console.log(`[MAIN_PHASE][SKIP] Driver ${ds.driver.id} to Passenger ${passenger.id}: No travel time available.`);
          continue;
        }
        const arrivalAtPickup = new Date(prevDropoffTime.getTime() + travelTimeToPickupSeconds * 1000);
        const { earliestPickup: passengerEarliestPickup, latestPickup: passengerLatestPickup } = this.mapPickupTimesToTargetDate(
          effectiveEarliest,
          effectiveLatest,
          targetDate
        );
        // If driver arrives after latest allowed, skip
        if (arrivalAtPickup > passengerLatestPickup) {
          console.log(`[MAIN_PHASE][SKIP] Driver ${ds.driver.id} to Passenger ${passenger.id}: Arrival after latest pickup. prevDropoffTime=${prevDropoffTime.toISOString()}, travelTimeToPickupSeconds=${travelTimeToPickupSeconds}, arrivalAtPickup=${arrivalAtPickup.toISOString()}, passengerLatestPickup=${passengerLatestPickup.toISOString()}`);
          continue;
        }
        // Idle gap: time from dropoff to when driver must leave for next pickup
        const mustLeaveBy = new Date(passengerEarliestPickup.getTime() - travelTimeToPickupSeconds * 1000);
        const idleGapMinutes = (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
        if (idleGapMinutes > 30 || idleGapMinutes < 0) {
          console.log(`[MAIN_PHASE][SKIP] Driver ${ds.driver.id} to Passenger ${passenger.id}: Idle gap too large or negative. prevDropoffTime=${prevDropoffTime.toISOString()}, mustLeaveBy=${mustLeaveBy.toISOString()}, idleGapMinutes=${idleGapMinutes.toFixed(1)}, travelTimeToPickupSeconds=${travelTimeToPickupSeconds}`);
          continue;
        }
        // Actual pickup time is max(arrival, earliest allowed)
        const estimatedPickupTime = new Date(Math.max(arrivalAtPickup.getTime(), passengerEarliestPickup.getTime()));
        const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
        const estimatedDropoffTime = new Date(estimatedPickupTime.getTime() + rideDurationSeconds * 1000);
        // Prefer the driver with the smallest idle gap (tightest chain)
        if (idleGapMinutes < bestIdleGap || (idleGapMinutes === bestIdleGap && estimatedPickupTime < (bestPickupTime || estimatedPickupTime))) {
          bestDriverIdx = d;
          bestIdleGap = idleGapMinutes;
          bestPickupTime = estimatedPickupTime;
          bestDropoffTime = estimatedDropoffTime;
          bestTravelTimeToPickupSeconds = travelTimeToPickupSeconds;
        }
      }
      if (bestDriverIdx !== null) {
        // Assign to the best existing driver
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
      } else {
        // Log why no assignment was made for this passenger
        console.log(`[MAIN_PHASE][SKIP] Passenger ${passenger.id}: No eligible driver found for chaining (all failed constraints).`);
      }
      // No existing driver can take this passenger, start a new driver
      // Find the next available driver
      const unusedDriverIdx = validDriversState.findIndex(ds => !driverSchedules.some(s => s.driver.id === ds.driver.id));
      if (unusedDriverIdx === -1) {
        // No more drivers available
        console.log(`[MAIN_PHASE][SKIP] Passenger ${passenger.id}: No unused drivers available.`);
        continue;
      }
      const ds = validDriversState[unusedDriverIdx];
      // Use precomputed travel time for first assignment
      const driverIdx = unusedDriverIdx;
      const passengerIdx = allPassengersForAssignment.findIndex(x => x.id === passenger.id);
      const travelData = travelMatrix[driverIdx][passengerIdx];
      if (!travelData || travelData.status !== 'OK') {
        console.log(`[MAIN_PHASE][SKIP] Passenger ${passenger.id}: No travel data for new driver.`);
        continue;
      }
      const travelTimeToPickupSeconds = travelData.duration.value;
      const arrivalAtPickup = new Date(ds.nextAvailableTime.getTime() + travelTimeToPickupSeconds * 1000);
      const { earliestPickup: passengerEarliestPickup, latestPickup: passengerLatestPickup } = this.mapPickupTimesToTargetDate(
        effectiveEarliest,
        effectiveLatest,
        targetDate
      );
      if (arrivalAtPickup > passengerLatestPickup) {
        console.log(`[MAIN_PHASE][SKIP] Passenger ${passenger.id}: New driver arrival after latest pickup. arrivalAtPickup=${arrivalAtPickup.toISOString()}, passengerLatestPickup=${passengerLatestPickup.toISOString()}`);
        continue;
      }
      const estimatedPickupTime = new Date(Math.max(arrivalAtPickup.getTime(), passengerEarliestPickup.getTime()));
      const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
      const estimatedDropoffTime = new Date(estimatedPickupTime.getTime() + rideDurationSeconds * 1000);
      driverSchedules.push({
        driver: ds.driver,
        schedule: [{
          passengerId: passenger.id,
              estimatedPickupTime,
          estimatedDropoffTime,
          travelTimeToPickupSeconds,
          carpoolGroup: bestCarpoolGroup,
          pickupLat: bestPickupLat,
          pickupLng: bestPickupLng,
          dropoffLat: bestDropoffLat,
          dropoffLng: bestDropoffLng,
        }],
        nextAvailableTime: estimatedDropoffTime,
        nextAvailableLat: bestDropoffLat,
        nextAvailableLng: bestDropoffLng,
        capacityLeft: ds.driver.capacity - (passenger.groupSize || 1),
      });
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
    // --- PHASE 5: Commit to Database ---
    // =================================================================
    console.log('[PLANNER] Phase 5: Committing assignments to database...');
    await this.commitScheduleToDatabase(assignmentsFromSchedule);

    // =================================================================
    // --- PHASE 5.5: Fallback Assignment for Unassigned Passengers ---
    // =================================================================
    const stillUnassigned = await this.ps.getUnassignedPassengers();
    if (stillUnassigned.length > 0) {
      console.log(`[FALLBACK] Assigning ${stillUnassigned.length} unassigned passengers using fallback phase...`);
      // Track assignment counts for each driver
      const driverAssignmentCounts: Record<string, number> = {};
      for (const ds of driverSchedules) {
        driverAssignmentCounts[ds.driver.id] = ds.schedule.length;
      }
      for (const passenger of stillUnassigned) {
        // For each driver, check if idle gap <= 30min, and record assignment count
        let bestDriver: typeof driverSchedules[0] | null = null;
        let bestIdleGap: number = Infinity;
        let bestPickupTime: Date | null = null;
        let bestDropoffTime: Date | null = null;
        let bestTravelTimeToPickupSeconds: number | null = null;
        let minAssignments = Infinity;
        for (const ds of driverSchedules) {
          const prevDropoffTime = ds.nextAvailableTime;
          const prevDropoffLat = ds.nextAvailableLat;
          const prevDropoffLng = ds.nextAvailableLng;
          const travelTimeToPickupSeconds = await this.gms.getTravelTimeInSeconds({
            origin: { lat: prevDropoffLat, lng: prevDropoffLng },
            destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
            departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
          });
          if (travelTimeToPickupSeconds === null) continue;
          const arrivalAtPickup = new Date(prevDropoffTime.getTime() + travelTimeToPickupSeconds * 1000);
          const estimatedPickupTime = new Date(Math.max(arrivalAtPickup.getTime(), passenger.earliestPickupTime ? new Date(passenger.earliestPickupTime).getTime() : new Date().getTime()));
          const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
          const estimatedDropoffTime = new Date(estimatedPickupTime.getTime() + rideDurationSeconds * 1000);
          // Calculate idle gap: time from last dropoff to when driver must leave for next pickup
          const mustLeaveBy = new Date(estimatedPickupTime.getTime() - travelTimeToPickupSeconds * 1000);
          const idleGapMinutes = (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
          if (idleGapMinutes > 30 || idleGapMinutes < 0) continue;
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
          // Assign to the best eligible driver (fewest assignments, then smallest idle gap)
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
          console.log(`[FALLBACK] Assigned passenger ${passenger.id} to driver ${bestDriver.driver.id} (fallback phase, idle gap: ${bestIdleGap.toFixed(1)} min, assignments: ${driverAssignmentCounts[bestDriver.driver.id]})`);
        }
        if (!assigned && driverSchedules.length > 0) {
          // Fallback: assign to earliest available driver (even if idle gap > 30min)
          let fallbackEarliestDriver: typeof driverSchedules[0] | null = null;
          let fallbackEarliestTime: Date | null = null;
          for (const ds of driverSchedules) {
            if (!fallbackEarliestTime || ds.nextAvailableTime < fallbackEarliestTime) {
              fallbackEarliestTime = ds.nextAvailableTime;
              fallbackEarliestDriver = ds;
            }
          }
          if (fallbackEarliestDriver) {
            const ds = fallbackEarliestDriver;
            const prevDropoffTime = ds.nextAvailableTime;
            const prevDropoffLat = ds.nextAvailableLat;
            const prevDropoffLng = ds.nextAvailableLng;
            const travelTimeToPickupSeconds = await this.gms.getTravelTimeInSeconds({
              origin: { lat: prevDropoffLat, lng: prevDropoffLng },
              destination: { lat: passenger.pickupLat, lng: passenger.pickupLng },
              departure_time: Math.floor(prevDropoffTime.getTime() / 1000),
            });
            const arrivalAtPickup = new Date(prevDropoffTime.getTime() + (travelTimeToPickupSeconds || 0) * 1000);
            const estimatedPickupTime = new Date(Math.max(arrivalAtPickup.getTime(), passenger.earliestPickupTime ? new Date(passenger.earliestPickupTime).getTime() : new Date().getTime()));
            const rideDurationSeconds = (passenger.estimatedDurationMin || 20) * 60;
            const estimatedDropoffTime = new Date(estimatedPickupTime.getTime() + rideDurationSeconds * 1000);
            ds.schedule.push({
              passengerId: passenger.id,
              estimatedPickupTime,
              estimatedDropoffTime,
              travelTimeToPickupSeconds: travelTimeToPickupSeconds || 0,
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
              travelTimeToPickupSeconds: travelTimeToPickupSeconds || 0,
              originLat: ds.nextAvailableLat ?? 0,
              originLng: ds.nextAvailableLng ?? 0,
              originTime: ds.nextAvailableTime ?? new Date(),
            });
            driverAssignmentCounts[ds.driver.id]++;
            console.log(`[FALLBACK] Assigned passenger ${passenger.id} to driver ${ds.driver.id} (fallback phase, idle gap > 30min, assignments: ${driverAssignmentCounts[ds.driver.id]})`);
          }
        }
      }
      // Commit fallback assignments
      await this.commitScheduleToDatabase(assignmentsFromSchedule);
    }
    // =================================================================
    // --- PHASE 6: Final Status Report ---
    // =================================================================
    const finalUnassigned = await this.ps.getUnassignedPassengers();
    for (const p of finalUnassigned) {
      let reason = 'No available driver within 30min idle gap and passenger time window.';
      if (!p.earliestPickupTime || !p.latestPickupTime) {
        reason = 'Missing pickup time data.';
      }
      console.log(`[UNASSIGNED] Passenger ${p.id} (${p.name || ''}): ${reason}`);
    }
          console.log(
      `[PLANNER] Cycle complete. ${assignmentsFromSchedule.length} passengers assigned, ${finalUnassigned.length} remain unassigned.`
    );
    const usedDrivers = assignmentsFromSchedule.map(a => a.driverId).filter((v, i, arr) => arr.indexOf(v) === i);
    console.log(
      `[PLANNER] Total drivers used: ${usedDrivers.length}`
    );

    // --- NEW: Driver Idle Time Efficiency Report ---
    const driverIdleStats: Record<string, { totalIdle: number, gaps: number, maxGap: number }> = {};
    for (const driverId of usedDrivers) {
      const schedule = assignmentsFromSchedule.filter(a => a.driverId === driverId)
        .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
      let totalIdle = 0;
      let maxGap = 0;
      let gaps = 0;
      for (let i = 1; i < schedule.length; i++) {
        const prevDropoff = schedule[i - 1].estimatedDropoffTime;
        const nextPickup = schedule[i].estimatedPickupTime;
        // Calculate travel time from previous dropoff to next pickup
        const travelTimeToPickupSeconds = schedule[i].travelTimeToPickupSeconds || 0;
        // The time the driver must leave previous dropoff to reach next pickup on time
        const mustLeaveBy = new Date(nextPickup.getTime() - travelTimeToPickupSeconds * 1000);
        const idleGap = (mustLeaveBy.getTime() - prevDropoff.getTime()) / 60000; // in minutes
        if (idleGap > 0) {
          totalIdle += idleGap;
          maxGap = Math.max(maxGap, idleGap);
          gaps++;
        }
      }
      driverIdleStats[driverId] = { totalIdle, gaps, maxGap };
    }
    const allGaps = Object.values(driverIdleStats).flatMap(d => d.gaps > 0 ? [d.totalIdle / d.gaps] : []);
    const avgIdleGap = allGaps.length ? (allGaps.reduce((a, b) => a + b, 0) / allGaps.length) : 0;
    const maxIdleGap = Math.max(...Object.values(driverIdleStats).map(d => d.maxGap), 0);
    console.log('===== DRIVER IDLE TIME EFFICIENCY REPORT =====');
    for (const driverId of usedDrivers) {
      const { totalIdle, gaps, maxGap } = driverIdleStats[driverId];
      console.log(`Driver ${driverId}: Total idle time: ${totalIdle.toFixed(1)} min, Idle gaps: ${gaps}, Max gap: ${maxGap.toFixed(1)} min, Avg gap: ${gaps ? (totalIdle / gaps).toFixed(1) : '0.0'} min`);
    }
    console.log(`Overall average idle gap: ${avgIdleGap.toFixed(1)} min, Max idle gap: ${maxIdleGap.toFixed(1)} min`);

    // validation
    const result = validateAdvancedAssignments(assignmentsFromSchedule);
    printAdvancedReport(result);

    // ===== PERFORMANCE SUMMARY REPORT =====
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
      if (a.travelTimeToPickupSeconds && a.travelTimeToPickupSeconds < 1800 && !a.carpoolGroup && a.status !== 'PENDING') {
        chainedAssignments++;
      }
    }
    // 2. Per-driver stats
    const driverAssignmentCounts: Record<string, number> = {};
    for (const a of assignmentsFromSchedule) {
      driverAssignmentCounts[a.driverId] = (driverAssignmentCounts[a.driverId] || 0) + 1;
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
    console.log(`Total Passengers Assigned: ${assignmentsFromSchedule.length} / ${assignmentsFromSchedule.length + finalUnassigned.length} (${((assignmentsFromSchedule.length / (assignmentsFromSchedule.length + finalUnassigned.length)) * 100).toFixed(0)}%)`);
    console.log(`Total Drivers Used: ${usedDrivers.length} / ${validDriversState.length} (${((usedDrivers.length / validDriversState.length) * 100).toFixed(0)}%)`);
    console.log('Assignments by Phase:');
    console.log(`  - Main/Chaining: ${mainPhaseAssignments}`);
    console.log(`  - Carpool: ${carpoolAssignments}`);
    console.log(`  - Fallback: ${fallbackAssignments}`);
    console.log('Driver Utilization:');
    console.log(`  - Average assignments per driver: ${avgAssignments.toFixed(1)}`);
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
      console.log(`  - Worst offender: ${largeIdleGapDrivers[0][0]} (${largeIdleGapDrivers[0][1].maxGap.toFixed(1)} min)`);
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
      console.log(`- Try to reduce large idle gaps for ${largeIdleGapDrivers.map(([id]) => id).join(', ')}.`);
    }
    if (fallbackAssignments > mainPhaseAssignments) {
      console.log('- Increase carpool/chaining in main phase to reduce fallback reliance.');
    }
    if (carpoolAssignments === 0) {
      console.log('- Enable or improve carpool logic for more efficiency.');
    }
    console.log('===============================================');

    // ===== PERF_AUDIT: Large Idle Gaps and Missed Opportunities =====
    for (const driverId of usedDrivers) {
      const schedule = assignmentsFromSchedule.filter(a => a.driverId === driverId)
        .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
      for (let i = 1; i < schedule.length; i++) {
        const prev = schedule[i - 1];
        const next = schedule[i];
        const travelTimeToPickupSeconds = next.travelTimeToPickupSeconds || 0;
        const mustLeaveBy = new Date(next.estimatedPickupTime.getTime() - travelTimeToPickupSeconds * 1000);
        const idleGap = (mustLeaveBy.getTime() - prev.estimatedDropoffTime.getTime()) / 60000;
        if (idleGap > 30) {
          console.log(`[PERF_AUDIT] Large idle gap detected for driver ${driverId}: ${idleGap.toFixed(1)} min between dropoff of passenger ${prev.passengerId} at ${prev.estimatedDropoffTime.toISOString()} and pickup of passenger ${next.passengerId} at ${next.estimatedPickupTime.toISOString()}`);
          // Try to find a better driver for 'next' assignment
          let betterDriver: string | null = null;
          let betterIdleGap: number = idleGap;
          for (const otherDriverId of usedDrivers) {
            if (otherDriverId === driverId) continue;
            const otherSchedule = assignmentsFromSchedule.filter(a => a.driverId === otherDriverId)
              .sort((a, b) => a.estimatedPickupTime - b.estimatedPickupTime);
            // Find the last assignment for this driver before next.estimatedPickupTime
            let lastAssignment = null;
            for (const a of otherSchedule) {
              if (a.estimatedDropoffTime <= next.estimatedPickupTime) {
                if (!lastAssignment || a.estimatedDropoffTime > lastAssignment.estimatedDropoffTime) {
                  lastAssignment = a;
                }
              }
            }
            const prevDropoffTime = lastAssignment ? lastAssignment.estimatedDropoffTime : null;
            // If this driver is free before next's pickup
            if (prevDropoffTime !== null) {
              const travelTimeToPickupSeconds = next.travelTimeToPickupSeconds || 0;
              const mustLeaveBy = new Date(next.estimatedPickupTime.getTime() - travelTimeToPickupSeconds * 1000);
              const otherIdleGap = (mustLeaveBy.getTime() - prevDropoffTime.getTime()) / 60000;
              if (otherIdleGap >= 0 && otherIdleGap <= 30 && otherIdleGap < betterIdleGap) {
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
            console.log(`[PERF_AUDIT] Better assignment possible: Passenger ${next.passengerId} could have been assigned to driver ${betterDriver} with idle gap ${betterIdleGap.toFixed(1)} min.`);
          }
        }
      }
    }
  }

  /**
   * Detect potential carpool opportunities among unassigned passengers
   */
  private detectCarpoolOpportunities(passengers: Passenger[]): Array<{
    primaryPassenger: Passenger;
    secondaryPassenger: Passenger;
    distance: number;
    timeGap: number;
    directionScore: number;
    overlapEarliest: Date;
    overlapLatest: Date;
  }> {
    const carpoolGroups: Array<{
      primaryPassenger: Passenger;
      secondaryPassenger: Passenger;
      distance: number;
      timeGap: number;
      directionScore: number;
      overlapEarliest: Date;
      overlapLatest: Date;
    }> = [];

    for (let i = 0; i < passengers.length; i++) {
      for (let j = i + 1; j < passengers.length; j++) {
        const p1 = passengers[i];
        const p2 = passengers[j];

        // Skip if either passenger is missing required data
        if (!p1.earliestPickupTime || !p1.latestPickupTime || 
            !p2.earliestPickupTime || !p2.latestPickupTime) {
          continue;
        }

        // Calculate distance between pickup locations
        const pickupDistance = this.calculateDistance(
          p1.pickupLat, p1.pickupLng,
          p2.pickupLat, p2.pickupLng
        );

        // Calculate time gap between pickup windows
        const p1EarliestTime = p1.earliestPickupTime ? new Date(p1.earliestPickupTime) : new Date();
        const p1LatestTime = p1.latestPickupTime ? new Date(p1.latestPickupTime) : new Date();
        const p2EarliestTime = p2.earliestPickupTime ? new Date(p2.earliestPickupTime) : new Date();
        const p2LatestTime = p2.latestPickupTime ? new Date(p2.latestPickupTime) : new Date();
        const p1MidTime = new Date((p1EarliestTime.getTime() + p1LatestTime.getTime()) / 2);
        const p2MidTime = new Date((p2EarliestTime.getTime() + p2LatestTime.getTime()) / 2);
        const timeGap = Math.abs(p1MidTime.getTime() - p2MidTime.getTime()) / (1000 * 60); // in minutes

        // Calculate direction compatibility score
        const directionScore = this.calculateDirectionCompatibility(p1, p2);

        // Calculate overlap window
        if (
          p1.earliestPickupTime === null ||
          p1.earliestPickupTime === undefined ||
          p1.latestPickupTime === null ||
          p1.latestPickupTime === undefined ||
          p2.earliestPickupTime === null ||
          p2.earliestPickupTime === undefined ||
          p2.latestPickupTime === null ||
          p2.latestPickupTime === undefined
        ) {
          continue;
        }
        const p1Earliest = p1.earliestPickupTime instanceof Date ? p1.earliestPickupTime : new Date(p1.earliestPickupTime);
        const p1Latest = p1.latestPickupTime instanceof Date ? p1.latestPickupTime : new Date(p1.latestPickupTime);
        const p2Earliest = p2.earliestPickupTime instanceof Date ? p2.earliestPickupTime : new Date(p2.earliestPickupTime);
        const p2Latest = p2.latestPickupTime instanceof Date ? p2.latestPickupTime : new Date(p2.latestPickupTime);
        const overlapEarliest = new Date(Math.max(p1Earliest.getTime(), p2Earliest.getTime()));
        const overlapLatest = new Date(Math.min(p1Latest.getTime(), p2Latest.getTime()));
        if (overlapEarliest > overlapLatest) continue; // No overlap, skip

        // Enhanced carpool criteria:
        // 1. Pickup locations within 2km of each other
        // 2. Pickup times within 45 minutes of each other
        // 3. Combined group size doesn't exceed typical driver capacity (4)
        // 4. Direction compatibility score >= 0.6 (passengers going in similar direction)
        if (pickupDistance <= 2.0 && 
            timeGap <= 45 && 
            (p1.groupSize + p2.groupSize) <= 4 &&
            directionScore >= 0.6) {
          carpoolGroups.push({
            primaryPassenger: p1,
            secondaryPassenger: p2,
            distance: pickupDistance,
            timeGap,
            directionScore,
            overlapEarliest,
            overlapLatest,
          });
        }
      }
    }

    // Sort by best carpool opportunities (direction score first, then distance, then time gap)
    carpoolGroups.sort((a, b) => {
      const scoreA = a.directionScore * 0.5 + (1 - a.distance / 2.0) * 0.3 + (1 - a.timeGap / 45) * 0.2;
      const scoreB = b.directionScore * 0.5 + (1 - b.distance / 2.0) * 0.3 + (1 - b.timeGap / 45) * 0.2;
      return scoreB - scoreA; // Higher score is better
    });

    // Remove overlapping carpool groups (a passenger can only be in one carpool)
    const usedPassengers = new Set<string>();
    const finalCarpoolGroups = [];

    for (const group of carpoolGroups) {
      if (!usedPassengers.has(group.primaryPassenger.id) && 
          !usedPassengers.has(group.secondaryPassenger.id)) {
        finalCarpoolGroups.push(group);
        usedPassengers.add(group.primaryPassenger.id);
        usedPassengers.add(group.secondaryPassenger.id);
        // Log the overlap window for this carpool
        console.log(`[CARPOOL_WINDOW] ${group.primaryPassenger.id} + ${group.secondaryPassenger.id}: Overlap window: ${group.overlapEarliest.toISOString()} to ${group.overlapLatest.toISOString()}`);
      }
    }

    return finalCarpoolGroups;
  }

  /**
   * Calculate direction compatibility between two passengers
   * Returns a score between 0 and 1, where 1 means perfect direction alignment
   */
  private calculateDirectionCompatibility(p1: Passenger, p2: Passenger): number {
    // Calculate vectors for both passengers' trips
    const p1Vector = {
      lat: p1.dropoffLat - p1.pickupLat,
      lng: p1.dropoffLng - p1.pickupLng
    };
    
    const p2Vector = {
      lat: p2.dropoffLat - p2.pickupLat,
      lng: p2.dropoffLng - p2.pickupLng
    };

    // Calculate magnitudes
    const p1Magnitude = Math.sqrt(p1Vector.lat * p1Vector.lat + p1Vector.lng * p1Vector.lng);
    const p2Magnitude = Math.sqrt(p2Vector.lat * p2Vector.lat + p2Vector.lng * p2Vector.lng);

    // Avoid division by zero
    if (p1Magnitude === 0 || p2Magnitude === 0) {
      return 0;
    }

    // Calculate dot product
    const dotProduct = p1Vector.lat * p2Vector.lat + p1Vector.lng * p2Vector.lng;
    
    // Calculate cosine similarity (angle between vectors)
    const cosineSimilarity = dotProduct / (p1Magnitude * p2Magnitude);
    
    // Convert to a 0-1 score where 1 means same direction, 0 means opposite directions
    const directionScore = (cosineSimilarity + 1) / 2;

    // Additional penalty for very different trip lengths (to avoid pairing short trips with very long ones)
    const lengthRatio = Math.min(p1Magnitude, p2Magnitude) / Math.max(p1Magnitude, p2Magnitude);
    const lengthPenalty = lengthRatio * 0.2; // Small penalty for length differences

    // Final score combines direction alignment and length similarity
    const finalScore = directionScore * 0.8 + lengthPenalty;

    return Math.max(0, Math.min(1, finalScore));
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async commitScheduleToDatabase(
    plannedAssignments: any[]
  ): Promise<Assignment[]> {
    const createdAssignments: Assignment[] = [];
    if (plannedAssignments.length === 0) {
      console.log('[DATABASE] No planned assignments to save.');
      return createdAssignments;
    }

    console.log(
      `[DATABASE] Committing ${plannedAssignments.length} planned assignments to the database...`
    );
    
    try {
      await prisma.$transaction(async (tx) => {
        // Keep track of all drivers who have received at least one assignment
        const driverIdsToUpdate = new Set<string>();

        for (const assignmentData of plannedAssignments) {
          // Handle carpool groups
          // if (assignmentData.carpoolGroup) {
          //   ... (carpool logic block)
          //   continue;
          // }
          // Handle regular single passenger assignment
          const result = await tx.passenger.updateMany({
            where: {
              id: assignmentData.passengerId,
              status: PassengerStatus.UNASSIGNED,
            },
            data: {
              status: PassengerStatus.ASSIGNED,
              assignedDriverId: assignmentData.driverId,
            },
          });

          if (result.count === 0) {
            console.warn(
              `[RACE_CONDITION] P-${assignmentData.passengerId} already taken. Skipping.`
            );
            continue;
          }

          const newAssignment = await tx.assignment.create({
            data: {
              driverId: assignmentData.driverId,
              passengerId: assignmentData.passengerId,
              status: assignmentData.status,
              estimatedPickupTime: assignmentData.estimatedPickupTime,
              estimatedDropoffTime: assignmentData.estimatedDropoffTime,
            },
          });

          await tx.driver.update({
            where: { id: assignmentData.driverId },
            data: {
              currentAssignmentId: newAssignment.id,
            },
          });

          createdAssignments.push(newAssignment);
          driverIdsToUpdate.add(assignmentData.driverId);
        }

        // After all assignments are created, update the status for all affected drivers
        if (driverIdsToUpdate.size > 0) {
          await tx.driver.updateMany({
            where: { id: { in: Array.from(driverIdsToUpdate) } },
            data: { status: DriverStatus.EN_ROUTE_TO_PICKUP },
          });
        }
      });
      
      console.log(
        `[DATABASE] Successfully saved ${createdAssignments.length} assignments.`
      );
    } catch (error) {
      console.error(`Error saving schedule to database:`, error);
    }

    return createdAssignments;
  }
  
}
