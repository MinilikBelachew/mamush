import { Request, Response } from 'express';
import { AssignmentService } from '../services/assign.js';
import { driverService } from '../services/driver.js';
import { startOfDay, endOfDay } from 'date-fns';

import {
  Assignment,
  Driver,
  DriverStatus,
  Passenger,
} from '@prisma/client';
import { prisma } from '@utils/prisma.js';
import { notifyDriverAssignmentsUpdated } from '../socket/socket.js';
import { runAssignmentCycle } from 'services/test.js';
import { DateTime } from 'luxon';
interface Location {
  lat: number;
  lng: number;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function haversineDistance(coords1: Location, coords2: Location): number {
  if (
    coords1.lat === null ||
    coords1.lng === null ||
    coords2.lat === null ||
    coords2.lng === null
  ) {
    console.warn('Attempted to calculate distance with null coordinates.');
    return NaN;
  }
  const R = 6371;
  const dLat = deg2rad(coords2.lat - coords1.lat);
  const dLon = deg2rad(coords2.lng - coords1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1.lat)) *
      Math.cos(deg2rad(coords2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

type AssignmentWithRelations = Assignment & {
  driver: Driver | null;
  passenger: Passenger | null;
  trip: any | null;
};

type AssignmentWithDistance = AssignmentWithRelations & {
  distanceToPickupKm: number | null;
};
const TARGET_SCHEDULING_ZONE = 'America/New_York';
export const triggerAssignmentCycle = async (req: Request, res: Response) => {
  try {
    // Get date from query parameter or request body
    const dateParam = req.query.date || req.body.date;

    if (!dateParam) {
      return res.status(400).json({
        message:
          'Date parameter is required. Use YYYY-MM-DD format. You can pass it as a query parameter (?date=YYYY-MM-DD) or in the request body ({ "date": "YYYY-MM-DD" }).',
      });
    }

    // Parse the date from parameter (expecting YYYY-MM-DD format)
    // const [year, month, day] = (dateParam as string).split('-').map(Number);
    // if (!year || !month || !day) {
    //   return res.status(400).json({
    //     message: 'Invalid date format. Use YYYY-MM-DD format.'
    //   });
    // }

    // Create date as UTC midnight for the specified date
    let targetDates: DateTime;
    targetDates = DateTime.fromISO(dateParam as string, {
      zone: TARGET_SCHEDULING_ZONE,
    });

    if (!targetDates.isValid) {
      return res.status(400).json({
        message: `Invalid date format or value for ${dateParam}. Use YYYY-MM-DD format. Error: ${targetDates.invalidExplanation || targetDates.invalidReason}.`,
      });
    }
    targetDates = targetDates.startOf('day');

    const targetDate = targetDates.toJSDate();

    console.log(
      `[CONTROLLER] Calculated targetDate: ${targetDate.toISOString()}`
    );
    console.log(
      `[CONTROLLER] About to call runAssignmentCycle with: ${targetDate.toISOString()}`
    );

    // const assignmentService = new AssignmentService();
    await runAssignmentCycle(targetDate);
    res.status(200).json({
      message: `Assignment cycle triggered successfully for ${targetDate.toISOString().split('T')[0]}.`,
      targetDate: targetDate.toISOString(),
    });
  } catch (error) {
    console.error('Error triggering assignment cycle:', error);
    res.status(500).json({
      message: 'Failed to trigger assignment cycle.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAssignedAssignments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const assignmentsFromDb: AssignmentWithRelations[] =
      await prisma.assignment.findMany({
        include: {
          driver: true,
          passenger: true,
          trip: true,
        },
        orderBy: {
          estimatedPickupTime: 'asc',
        },
      });

    if (!assignmentsFromDb || assignmentsFromDb.length === 0) {
      res.status(404).json({ message: 'No assignments found.' });
      return;
    }

    // Group assignments by driverId
    const grouped: Record<string, AssignmentWithRelations[]> = {};
    for (const assignment of assignmentsFromDb) {
      if (!assignment.driverId) continue;
      grouped[assignment.driverId] ??= [];
      grouped[assignment.driverId].push(assignment);
    }

    const assignmentsWithDistance: AssignmentWithDistance[] = [];

    for (const driverId in grouped) {
      const assignments = grouped[driverId];
      let prevDropoff: Location | null = null;

      for (const assignment of assignments) {
        let distanceToPickupKm: number | null = null;

        const { driver, passenger, trip } = assignment;
        if (!driver || !passenger) {
          assignmentsWithDistance.push({
            ...assignment,
            distanceToPickupKm: null,
          });
          continue;
        }

        let cleanedTrip = trip;
        let parsedWaypoints: any[] = [];

        if (
          trip?.orderedWaypointsJson &&
          typeof trip.orderedWaypointsJson === 'string'
        ) {
          try {
            parsedWaypoints = JSON.parse(trip.orderedWaypointsJson);
            cleanedTrip = {
              ...trip,
              orderedWaypointsJson: parsedWaypoints,
            };
          } catch (err) {
            console.warn(
              `Failed to parse orderedWaypointsJson for trip ID ${trip.id}`
            );
          }
        }

        let driverLocation: Location | null = prevDropoff;

        // 2. If not available, check parsed waypoints
        if (!driverLocation && parsedWaypoints.length > 0) {
          const pickupIndex = parsedWaypoints.findIndex(
            (wp: any) => wp.type === 'PICKUP' && wp.passengerId === passenger.id
          );
          if (pickupIndex > 0) {
            const prev = parsedWaypoints[pickupIndex - 1];
            driverLocation = { lat: prev.lat, lng: prev.lng };
          }
        }

        // 3. Fallback to driver's lastDropoff
        if (!driverLocation && driver.lastDropoffLat && driver.lastDropoffLng) {
          driverLocation = {
            lat: driver.lastDropoffLat,
            lng: driver.lastDropoffLng,
          };
        }

        // 4. Fallback to current location
        if (!driverLocation && driver.currentLat && driver.currentLng) {
          driverLocation = {
            lat: driver.currentLat,
            lng: driver.currentLng,
          };
        }

        // Final calculation
        if (
          driverLocation &&
          passenger.pickupLat !== null &&
          passenger.pickupLng !== null
        ) {
          const pickupLocation: Location = {
            lat: passenger.pickupLat,
            lng: passenger.pickupLng,
          };
          const distance = haversineDistance(driverLocation, pickupLocation);
          distanceToPickupKm = parseFloat(distance.toFixed(2));
        } else {
          console.warn(
            `Missing location data for assignment ID ${assignment.id}.`
          );
        }

        // Save this dropoff for the next assignment in sequence
        if (passenger.dropoffLat && passenger.dropoffLng) {
          prevDropoff = {
            lat: passenger.dropoffLat,
            lng: passenger.dropoffLng,
          };
        }

        assignmentsWithDistance.push({
          ...assignment,
          trip: cleanedTrip,
          distanceToPickupKm,
        });
      }
    }

    res.status(200).json(assignmentsWithDistance);
  } catch (error) {
    console.error('Error fetching assigned assignments:', error);
    res.status(500).json({
      message: 'Failed to fetch assigned assignments.',
    });
  }
};

export const getAllUnAssigned = async (req: Request, res: Response) => {
  try {
    const Unassigned = await prisma.passenger.findMany({
      where: { status: 'UNASSIGNED' },
      include: {
        assignments: true,
        assignedDriver: true,
      },
    });
    res.status(200).json(Unassigned);
  } catch (error) {
    console.log('error fetching Unassigned', error);
  }
};

// export const assignReserves = async (req: Request, res: Response) => {
//   try {
//     const { passengerId } = req.body;
//     if (!passengerId) {
//       return res.status(400).json({ message: 'Passenger ID is required.' });
//     }

//     const [passenger, drivers] = await Promise.all([
//       prisma.passenger.findUnique({
//         where: { id: passengerId, status: 'UNASSIGNED' },
//       }),
//       prisma.driver.findMany({
//         where: { status: 'IDLE' },
//       }),
//     ]);

//     if (!passenger) {
//       return res.status(404).json({ message: 'Unassigned passenger not found.' });
//     }
//     if (drivers.length === 0) {
//       return res.status(404).json({ message: 'No idle drivers available.' });
//     }

//     const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
//     if (!accessToken) {
//         throw new Error("Mapbox access token is not configured.");
//     }

//     // Calculate travel time for each driver using Mapbox
//     const rankedDrivers = await Promise.all(
//       drivers.map(async (driver) => {
//         // IMPORTANT: Mapbox uses the format [longitude, latitude]
//         const originCoords = `${driver.currentLng},${driver.currentLat}`;
//         const destCoords = `${passenger.pickupLng},${passenger.pickupLat}`;

//         const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${originCoords};${destCoords}?access_token=${accessToken}`;

//         let travelTimeInSeconds = Infinity;
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             if (data.routes && data.routes.length > 0) {
//               // The duration from the API is already in seconds
//               travelTimeInSeconds = data.routes[0].duration;
//             }
//         } catch (apiError) {
//             console.error(`Mapbox API failed for driver ${driver.id}:`, apiError);
//         }

//         return {
//           ...driver,
//           travelTimeInSeconds,
//         };
//       })
//     );

//     // Sort drivers by the calculated travel time (closest first)
//     rankedDrivers.sort((a, b) => a.travelTimeInSeconds - b.travelTimeInSeconds);

//     res.status(200).json({
//       passenger,
//       rankedDrivers,
//     });

//   } catch (error) {
//     console.error('[ERROR] Failed to assign reserves:', error);
//     res.status(500).json({ message: 'An internal server error occurred.' });
//   }
// };

// export const assignReserves = async (req: Request, res: Response) => {
//   try {
//     const { passengerId, scheduledDate } = req.body;

//     // Validate input
//     if (!passengerId) {
//       return res.status(400).json({ message: 'Passenger ID is required.' });
//     }

//     // Fetch passenger and ensure they are unassigned
//     const passenger = await prisma.passenger.findUnique({
//       where: { id: passengerId, status: 'UNASSIGNED' },
//     });
//     if (!passenger) {
//       return res.status(404).json({ message: 'Unassigned passenger not found.' });
//     }

//     // Use scheduledDate from request or fall back to passenger.earliestPickupTime
//     let parsedScheduledDate: Date;
//     if (scheduledDate) {
//       parsedScheduledDate = new Date(scheduledDate);
//       if (isNaN(parsedScheduledDate.getTime())) {
//         return res.status(400).json({ message: 'Invalid scheduled date.' });
//       }
//     } else if (passenger.earliestPickupTime) {
//       parsedScheduledDate = passenger.earliestPickupTime;
//     } else {
//       return res.status(400).json({ message: 'No scheduled date provided and passenger has no earliest pickup time.' });
//     }

//     console.log('Passenger Details:', {
//       id: passenger.id,
//       earliestPickupTime: passenger.earliestPickupTime?.toISOString(),
//       latestPickupTime: passenger.latestPickupTime?.toISOString(),
//       pickupLat: passenger.pickupLat,
//       pickupLng: passenger.pickupLng,
//       groupSize: passenger.groupSize,
//     });
//     // Validate scheduled date against passenger's constraints
//     // if (passenger.earliestPickupTime && parsedScheduledDate < passenger.earliestPickupTime) {
//     //   return res.status(400).json({ message: 'Scheduled date is earlier than allowed.' });
//     // }
//     // if (passenger.latestPickupTime && parsedScheduledDate > passenger.latestPickupTime) {
//     //   return res.status(400).json({ message: 'Scheduled date is later than allowed.' });
//     // }

//     // Fetch drivers who are IDLE or EN_ROUTE_TO_PICKUP and available during the scheduled date
//     const drivers = await prisma.driver.findMany({
//       where: {
//         OR: [
//           { status: 'IDLE' },
//           { status: 'EN_ROUTE_TO_PICKUP' },
//         ],
//         availabilityStart: { lte: parsedScheduledDate },
//         availabilityEnd: { gte: parsedScheduledDate },
//         capacity: { gte: passenger.groupSize },
//       },
//     });
//     if (drivers.length === 0) {
//       return res.status(404).json({ message: 'No drivers available for the scheduled date.' });
//     }

//     console.log('Available Drivers:', drivers.map(d => ({
//       id: d.id,
//       status: d.status,
//       currentLat: d.currentLat,
//       currentLng: d.currentLng,
//       lastDropoffLat: d.lastDropoffLat,
//       lastDropoffLng: d.lastDropoffLng,
//       lastDropoffTimestamp: d.lastDropoffTimestamp?.toISOString(),
//     })));

//     const accessToken = process.env.MAPBOX_API_KEY;
//     if (!accessToken) {
//       throw new Error('Mapbox access token is not configured.');
//     }

//     // Calculate estimated arrival time for each driver
//     const rankedDrivers = await Promise.all(
//       drivers.map(async (driver) => {
//         let originLat = driver.currentLat;
//         let originLng = driver.currentLng;
//         let baseTime = new Date(); // Current time as fallback

//         // For EN_ROUTE_TO_PICKUP drivers, use dropoff location and time
//         if (driver.status === 'EN_ROUTE_TO_PICKUP' && driver.lastDropoffLat && driver.lastDropoffLng && driver.lastDropoffTimestamp) {
//           originLat = driver.lastDropoffLat;
//           originLng = driver.lastDropoffLng;
//           baseTime = driver.lastDropoffTimestamp;
//         }

//         const originCoords = `${originLng},${originLat}`;
//         const destCoords = `${passenger.pickupLng},${passenger.pickupLat}`;
//         const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${originCoords};${destCoords}?access_token=${accessToken}`;

//         let travelTimeInSeconds = Infinity;
//         try {
//           const response = await fetch(url);
//           if (!response.ok) {
//             throw new Error(`Mapbox API returned status ${response.status}`);
//           }
//           const data = await response.json();
//           if (data.routes && data.routes.length > 0) {
//             travelTimeInSeconds = data.routes[0].duration;
//           }
//         } catch (apiError) {
//           console.error(`Mapbox API failed for driver ${driver.id}:`, apiError);
//         }

//         // Calculate estimated arrival time
//         const estimatedArrivalTime = new Date(baseTime.getTime() + travelTimeInSeconds * 1000);

//         return {
//           ...driver,
//           travelTimeInSeconds,
//           estimatedArrivalTime,
//         };
//       })
//     );

//     console.log('Ranked Drivers:', rankedDrivers.map(d => ({
//       id: d.id,
//       status: d.status,
//       travelTimeInSeconds: d.travelTimeInSeconds,
//       estimatedArrivalTime: d.estimatedArrivalTime.toISOString(),
//       isAfterLatestPickup: passenger.latestPickupTime ? d.estimatedArrivalTime > passenger.latestPickupTime : false,
//     })));

//     // Filter out drivers who cannot arrive by latestPickupTime (if set)
//     const feasibleDrivers = rankedDrivers.filter(
//       (driver) => !passenger.latestPickupTime || driver.estimatedArrivalTime <= passenger.latestPickupTime
//     );

//     if (feasibleDrivers.length === 0) {
//       return res.status(404).json({ message: 'No drivers can arrive by the required pickup time.' });
//     }

//     // Sort drivers by estimated arrival time (earliest first)
//     feasibleDrivers.sort((a, b) => a.estimatedArrivalTime.getTime() - b.estimatedArrivalTime.getTime());

//     // Select the best driver (earliest arrival)
//     const bestDriver = feasibleDrivers[0];

//     // Create an assignment using the scheduled date
//     const assignment = await prisma.assignment.create({
//       data: {
//         driverId: bestDriver.id,
//         passengerId: passenger.id,
//         assignedAt: new Date(),
//         estimatedPickupTime: parsedScheduledDate,
//         status: 'PENDING',
//         estimatedDropoffTime: passenger.estimatedDurationMin
//           ? new Date(parsedScheduledDate.getTime() + passenger.estimatedDurationMin * 60 * 1000)
//           : undefined,
//       },
//       include: { passenger: true, driver: true },
//     });

//     // Update passenger and driver statuses
//     await prisma.$transaction([
//       prisma.passenger.update({
//         where: { id: passenger.id },
//         data: { status: 'ASSIGNED', assignedDriverId: bestDriver.id },
//       }),
//       prisma.driver.update({
//         where: { id: bestDriver.id },
//         data: { status: 'EN_ROUTE_TO_PICKUP' },
//       }),
//     ]);

//     console.log('Assignment Created:', {
//       assignmentId: assignment.id,
//       driverId: bestDriver.id,
//       passengerId: passenger.id,
//       estimatedPickupTime: assignment.estimatedPickupTime?.toISOString(),
//     });

//     return res.status(200).json({
//       message: 'Scheduled ride assigned successfully.',
//       assignment,
//       rankedDrivers: feasibleDrivers,
//     });
//   } catch (error) {
//     console.error('[ERROR] Failed to assign reserves:', error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       return res.status(500).json({
//         message: 'Database error while assigning ride.',
//         code: error.code,
//       });
//     }
//     return res.status(500).json({ message: 'An internal server error occurred.' });
//   }
// };

export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    const { passengerId, scheduledDate } = req.body;

    if (!passengerId) {
      return res.status(400).json({ message: 'Passenger ID is required.' });
    }

    const passenger = await prisma.passenger.findUnique({
      where: { id: passengerId, status: 'UNASSIGNED' },
    });

    if (!passenger) {
      return res
        .status(404)
        .json({ message: 'Unassigned passenger not found.' });
    }

    let parsedScheduledDate: Date;
    if (scheduledDate) {
      parsedScheduledDate = new Date(scheduledDate);
      if (isNaN(parsedScheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled date.' });
      }
    } else if (passenger.earliestPickupTime) {
      parsedScheduledDate = passenger.earliestPickupTime;
    } else {
      return res.status(400).json({ message: 'No scheduled date provided.' });
    }

    const drivers = await prisma.driver.findMany({
      where: {
        OR: [{ status: 'IDLE' }, { status: 'EN_ROUTE_TO_PICKUP' }],
        availabilityStart: { lte: parsedScheduledDate },
        availabilityEnd: { gte: parsedScheduledDate },
        capacity: { gte: passenger.groupSize },
      },
    });

    if (drivers.length === 0) {
      return res.status(200).json({
        message: 'No available drivers during this window.',
        rankedDrivers: [],
        bestDriver: null,
      });
    }

    const accessToken = process.env.MAPBOX_API_KEY;
    if (!accessToken) throw new Error('Mapbox access token not configured.');

    const rankedDrivers = await Promise.all(
      drivers.map(async (driver) => {
        let originLat = driver.currentLat;
        let originLng = driver.currentLng;
        let baseTime = new Date();

        if (
          driver.status === 'EN_ROUTE_TO_PICKUP' &&
          driver.lastDropoffLat &&
          driver.lastDropoffLng &&
          driver.lastDropoffTimestamp
        ) {
          originLat = driver.lastDropoffLat;
          originLng = driver.lastDropoffLng;
          baseTime = driver.lastDropoffTimestamp;
        }

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${originLng},${originLat};${passenger.pickupLng},${passenger.pickupLat}?access_token=${accessToken}`;

        let travelTimeInSeconds = Infinity;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes?.[0]) {
            travelTimeInSeconds = data.routes[0].duration;
          }
        } catch (err) {
          console.error(`Mapbox error for driver ${driver.id}:`, err);
        }

        const estimatedArrivalTime = new Date(
          baseTime.getTime() + travelTimeInSeconds * 1000
        );
        const isFeasible =
          !passenger.latestPickupTime ||
          estimatedArrivalTime <= passenger.latestPickupTime;

        return {
          ...driver,
          travelTimeInSeconds,
          estimatedArrivalTime,
          isFeasible,
        };
      })
    );

    // Sort by soonest arrival, regardless of feasibility
    rankedDrivers.sort(
      (a, b) =>
        a.estimatedArrivalTime.getTime() - b.estimatedArrivalTime.getTime()
    );

    const bestDriver =
      rankedDrivers.find((d) => d.isFeasible) || rankedDrivers[0];

    return res.status(200).json({
      message: bestDriver?.isFeasible
        ? 'Best feasible driver found.'
        : 'No feasible driver — returning best-ranked alternative.',
      rankedDrivers,
      bestDriver,
    });
  } catch (error) {
    console.error('Error in getAvailableDrivers:', error);
    return res.status(500).json({ message: 'Server error fetching drivers.' });
  }
};

export const assignSelectedDriver = async (req: Request, res: Response) => {
  try {
    const { passengerId, driverId, scheduledDate } = req.body;

    if (!passengerId || !driverId || !scheduledDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const passenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
    });

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!passenger || !driver) {
      return res
        .status(404)
        .json({ message: 'Passenger or driver not found.' });
    }

    const parsedScheduledDate = new Date(scheduledDate);

    const assignment = await prisma.assignment.create({
      data: {
        driverId,
        passengerId,
        assignedAt: new Date(),
        estimatedPickupTime: parsedScheduledDate,
        status: 'PENDING',
        estimatedDropoffTime: passenger.estimatedDurationMin
          ? new Date(
              parsedScheduledDate.getTime() +
                passenger.estimatedDurationMin * 60 * 1000
            )
          : undefined,
      },
      include: { passenger: true, driver: true },
    });

    await prisma.$transaction([
      prisma.passenger.update({
        where: { id: passenger.id },
        data: { status: 'ASSIGNED', assignedDriverId: driverId },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: { status: 'EN_ROUTE_TO_PICKUP' },
      }),
    ]);

  // Notify the assigned driver in real time
  try {
    notifyDriverAssignmentsUpdated(driverId, {
      assignmentId: assignment.id,
      passengerId: passenger.id,
      driverId,
      estimatedPickupTime: assignment.estimatedPickupTime,
    });
  } catch (e) {
    console.warn('Failed to notify driver via socket:', (e as Error).message);
  }

  return res
      .status(200)
      .json({ message: 'Driver assigned successfully.', assignment });
  } catch (error) {
    console.error('Error in assignSelectedDriver:', error);
    return res.status(500).json({ message: 'Server error assigning driver.' });
  }
};

export const getAssignmentHistoryByDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { date: dateParam } = req.query;

    if (!dateParam || typeof dateParam !== 'string') {
      res.status(400).json({
        message: 'Missing or invalid "date" query param (YYYY-MM-DD expected).',
      });
      return;
    }

    // Luxon parsing with timezone
    const targetDates = DateTime.fromISO(dateParam, {
      zone: process.env.TARGET_SCHEDULING_ZONE || 'UTC',
    });

    if (!targetDates.isValid) {
      res.status(400).json({
        message: `Invalid date format or value for ${dateParam}. Use YYYY-MM-DD format. Error: ${targetDates.invalidExplanation || targetDates.invalidReason}.`,
      });
      return;
    }

    const startOfDay = targetDates.startOf('day').toJSDate();
    const endOfDay = targetDates.endOf('day').toJSDate();

    console.log(
      `[CONTROLLER] Calculated range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
    );

    // Query assignments completed or dropped on that day
    const history = await prisma.assignment.findMany({
      where: {
        status: {
          in: [
            'COMPLETED',
            'FAILED',
            'CANCELLED_BY_DRIVER',
            'CANCELLED_BY_PASSENGER',
          ],
        },
        OR: [
          { actualDropoffTime: { gte: startOfDay, lte: endOfDay } },
          { estimatedDropoffTime: { gte: startOfDay, lte: endOfDay } },
        ],
      },
      include: {
        driver: true,
        passenger: true,
        trip: true,
      },
      orderBy: {
        estimatedPickupTime: 'asc',
      },
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ message: 'Failed to fetch assignment history.' });
  }
};

export const updateDriverStatusManually = async (
  req: Request,
  res: Response
) => {
  const { driverId } = req.params;
  const { status, lat, lng } = req.body as {
    status: DriverStatus;
    lat?: number;
    lng?: number;
  };

  if (!driverId || !status) {
    return res
      .status(400)
      .json({ message: 'Driver ID and status are required.' });
  }
  if (!Object.values(DriverStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid driver status.' });
  }

  try {
    const location =
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
    const driver = await driverService.updateDriverStatus(
      driverId,
      status,
      location
    );
    if (!driver) {
      return res
        .status(404)
        .json({ message: 'Driver not found or update failed.' });
    }
    res.status(200).json(driver);
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({
      message: 'Failed to update driver status.',
      error: (error as Error).message,
    });
  }
};

export const getAlongTripAssignments = async (req: Request, res: Response) => {
  try {
    const trip = await prisma.trip.findMany({
      include: {
        driver: true,
        assignments: {
          include: {
            passenger: true,
            driver: true,
          },
          orderBy: {
            estimatedPickupTime: 'asc',
          },
        },
      },
    });

    // Parse waypoints for each trip
    const parsedTrips = trip.map((t) => ({
      ...t,
      orderedWaypoints: safeParseWaypoints(t.orderedWaypointsJson ?? '[]'),
    }));

    res.status(200).json(parsedTrips);
  } catch (error) {
    console.error('Error fetching along-trip assignments:', error);
    res.status(500).json({
      message: 'Failed to fetch along-trip assignments.',
      error: (error as Error).message,
    });
  }
};

// Helper to safely parse the JSON string
const safeParseWaypoints = (jsonStr: string) => {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
};

export const getDriversAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query; 

  try {
    if (!id) {
      return res.status(400).json({ message: 'Driver ID is required.' });
    }

    let dateFilter = {};
    if (date) {
      const parsedDate = new Date(date as string);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }

      dateFilter = {
        estimatedPickupTime: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      };
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        driverId: id,
        ...dateFilter,
      },
      include: {
        passenger: true,
        trip: true,
      },
      orderBy: {
        estimatedPickupTime: 'asc',
      },
    });

    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ message: 'No assignments found for this driver.' });
    }

    return res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching driver assignments:', error);
    return res.status(500).json({
      message: 'Failed to fetch driver assignments.',
      error: (error as Error).message,
    });
  }
};

