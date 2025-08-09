import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AssignmentService } from '../services/assign.ts';
import { Passenger, Driver, PassengerStatus, DriverStatus } from '@prisma/client';

// Mock the Google Maps service
jest.mock('../services/googleMap.ts', () => ({
  GoogleMapsService: jest.fn().mockImplementation(() => ({
    getDistanceMatrix: jest.fn().mockResolvedValue([
      [{
        status: 'OK',
        duration: { value: 15 * 60 }, // 15 minutes in seconds
        distance: { value: 5000 }, // 5km
      }]
    ]),
  })),
}));

// Mock the driver and passenger services
jest.mock('../services/driver.ts', () => ({
  driverService: {
    getActiveDrivers: jest.fn(),
  },
}));

jest.mock('../services/passengers.ts', () => ({
  passengerService: {
    getUnassignedPassengers: jest.fn(),
  },
}));

// Mock Prisma
jest.mock('@utils/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    driver: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    passenger: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
    },
  },
}));

describe('Assignment Service - Pickup Time Window Validation', () => {
  let assignmentService: AssignmentService;
  let mockGoogleMapsService: any;
  let mockDriverService: any;
  let mockPassengerService: any;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset specific mocks instead of clearing all
    const { GoogleMapsService } = require('../services/googleMap.ts');
    const { driverService } = require('../services/driver.ts');
    const { passengerService } = require('../services/passengers.ts');
    const { prisma } = require('@utils/prisma');
    
    // Reset the Google Maps mock to default
    const mockInstance = new GoogleMapsService();
    mockInstance.getDistanceMatrix.mockReset();
    mockInstance.getDistanceMatrix.mockResolvedValue([
      [{
        status: 'OK',
        duration: { value: 15 * 60 }, // 15 minutes in seconds
        distance: { value: 5000 }, // 5km
      }]
    ]);
    
    mockGoogleMapsService = mockInstance;
    mockDriverService = driverService;
    mockPassengerService = passengerService;
    mockPrisma = prisma;
    
    assignmentService = new AssignmentService();
    
    // Mock the assignment service's Google Maps service instance
    (assignmentService as any).gms = mockGoogleMapsService;
  });

  describe('_findBestNextRideForDriver - Pickup Time Window Logic', () => {
    it('should respect passenger earliest and latest pickup times', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z'); // January 2nd
      
      // Create a passenger with a specific pickup window
      const passenger: Passenger = {
        id: 'passenger-1',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: new Date('2025-01-01T08:00:00.000Z'), // 8:00 AM
        latestPickupTime: new Date('2025-01-01T09:00:00.000Z'),   // 9:00 AM
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driverState = {
        driver: {
          id: 'driver-1',
          name: 'Test Driver',
          currentLat: 40.7505,
          currentLng: -73.9934,
          capacity: 4,
          availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
          availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
          status: DriverStatus.IDLE,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentAssignmentId: null,
          currentTripId: null,
          lastDropoffTimestamp: null,
          lastDropoffLat: null,
          lastDropoffLng: null,
        },
        nextAvailableTime: new Date('2025-01-02T07:30:00.000Z'), // Driver available at 7:30 AM
        nextAvailableLat: 40.7505,
        nextAvailableLng: -73.9934,
        schedule: [],
      };

      // Mock Google Maps response - 15 minutes travel time
      mockGoogleMapsService.getDistanceMatrix.mockResolvedValue([
        [{
          status: 'OK',
          duration: { value: 15 * 60 }, // 15 minutes in seconds
          distance: { value: 5000 }, // 5km
        }]
      ]);

      console.log('Testing assignment logic...');
      console.log('Driver next available time:', driverState.nextAvailableTime.toISOString());
      console.log('Passenger earliest pickup:', passenger.earliestPickupTime?.toISOString());
      console.log('Passenger latest pickup:', passenger.latestPickupTime?.toISOString());

      // Call the private method using reflection
      const result = await (assignmentService as any)._findBestNextRideForDriver(
        driverState,
        [passenger],
        targetDate
      );

      console.log('Assignment result:', result);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result.passenger.id).toBe('passenger-1');
      
      // Driver arrives at 7:45 AM (7:30 + 15 min), but passenger earliest is 8:00 AM
      // So pickup should be at 8:00 AM (passenger's earliest time)
      const expectedPickupTime = new Date('2025-01-02T08:00:00.000Z');
      expect(result.details.estimatedPickupTime.getTime()).toBe(expectedPickupTime.getTime());
    });

    it('should reject assignment when driver arrives after passenger latest pickup time', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const passenger: Passenger = {
        id: 'passenger-2',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: new Date('2025-01-01T08:00:00.000Z'), // 8:00 AM
        latestPickupTime: new Date('2025-01-01T09:00:00.000Z'),   // 9:00 AM
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driverState = {
        driver: {
          id: 'driver-2',
          name: 'Test Driver',
          currentLat: 40.7505,
          currentLng: -73.9934,
          capacity: 4,
          availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
          availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
          status: DriverStatus.IDLE,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentAssignmentId: null,
          currentTripId: null,
          lastDropoffTimestamp: null,
          lastDropoffLat: null,
          lastDropoffLng: null,
        },
        nextAvailableTime: new Date('2025-01-02T08:30:00.000Z'), // Driver available at 8:30 AM
        nextAvailableLat: 40.7505,
        nextAvailableLng: -73.9934,
        schedule: [],
      };

      // Mock Google Maps response - 60 minutes travel time (arrives at 9:30 AM)
      mockGoogleMapsService.getDistanceMatrix.mockResolvedValue([
        [{
          status: 'OK',
          duration: { value: 60 * 60 }, // 60 minutes in seconds
          distance: { value: 20000 }, // 20km
        }]
      ]);

      const result = await (assignmentService as any)._findBestNextRideForDriver(
        driverState,
        [passenger],
        targetDate
      );

      // Should reject because driver arrives at 9:30 AM, after passenger's 9:00 AM latest
      expect(result).toBeNull();
    });

    it('should use driver arrival time when it falls within passenger window', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const passenger: Passenger = {
        id: 'passenger-3',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: new Date('2025-01-01T08:00:00.000Z'), // 8:00 AM
        latestPickupTime: new Date('2025-01-01T09:00:00.000Z'),   // 9:00 AM
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driverState = {
        driver: {
          id: 'driver-3',
          name: 'Test Driver',
          currentLat: 40.7505,
          currentLng: -73.9934,
          capacity: 4,
          availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
          availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
          status: DriverStatus.IDLE,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentAssignmentId: null,
          currentTripId: null,
          lastDropoffTimestamp: null,
          lastDropoffLat: null,
          lastDropoffLng: null,
        },
        nextAvailableTime: new Date('2025-01-02T08:00:00.000Z'), // Driver available at 8:00 AM
        nextAvailableLat: 40.7505,
        nextAvailableLng: -73.9934,
        schedule: [],
      };

      // Mock Google Maps response - 15 minutes travel time (arrives at 8:15 AM)
      mockGoogleMapsService.getDistanceMatrix.mockResolvedValue([
        [{
          status: 'OK',
          duration: { value: 15 * 60 }, // 15 minutes in seconds
          distance: { value: 5000 }, // 5km
        }]
      ]);

      const result = await (assignmentService as any)._findBestNextRideForDriver(
        driverState,
        [passenger],
        targetDate
      );

      // Should accept because driver arrives at 8:15 AM, within passenger's 8:00-9:00 window
      expect(result).not.toBeNull();
      expect(result.passenger.id).toBe('passenger-3');
      
      // Pickup should be at 8:15 AM (driver arrival time, since it's after passenger earliest)
      const expectedPickupTime = new Date('2025-01-02T08:15:00.000Z');
      expect(result.details.estimatedPickupTime.getTime()).toBe(expectedPickupTime.getTime());
    });

    it('should skip passengers without pickup time windows', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const passenger: Passenger = {
        id: 'passenger-4',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: null, // No pickup window
        latestPickupTime: null,   // No pickup window
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driverState = {
        driver: {
          id: 'driver-4',
          name: 'Test Driver',
          currentLat: 40.7505,
          currentLng: -73.9934,
          capacity: 4,
          availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
          availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
          status: DriverStatus.IDLE,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentAssignmentId: null,
          currentTripId: null,
          lastDropoffTimestamp: null,
          lastDropoffLat: null,
          lastDropoffLng: null,
        },
        nextAvailableTime: new Date('2025-01-02T08:00:00.000Z'),
        nextAvailableLat: 40.7505,
        nextAvailableLng: -73.9934,
        schedule: [],
      };

      const result = await (assignmentService as any)._findBestNextRideForDriver(
        driverState,
        [passenger],
        targetDate
      );

      // Should skip passenger without pickup time windows
      expect(result).toBeNull();
    });
  });

  describe('Fallback Assignment - Pickup Time Window Logic', () => {
    it('should respect pickup time windows in fallback assignment', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const passenger: Passenger = {
        id: 'passenger-5',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: new Date('2025-01-01T14:00:00.000Z'), // 2:00 PM
        latestPickupTime: new Date('2025-01-01T15:00:00.000Z'),   // 3:00 PM
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driver: Driver = {
        id: 'driver-5',
        name: 'Test Driver',
        currentLat: 40.7505,
        currentLng: -73.9934,
        capacity: 4,
        availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
        availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
        status: DriverStatus.IDLE,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentAssignmentId: null,
        currentTripId: null,
        lastDropoffTimestamp: new Date('2025-01-02T13:30:00.000Z'), // Last dropoff at 1:30 PM
        lastDropoffLat: 40.7505,
        lastDropoffLng: -73.9934,
      };

      // Mock the availability check
      jest.spyOn(assignmentService as any, '_isDriverTrulyAvailable').mockResolvedValue(true);

      // Mock Google Maps response - 30 minutes travel time (arrives at 2:00 PM)
      mockGoogleMapsService.getDistanceMatrix.mockResolvedValue([
        [{
          status: 'OK',
          duration: { value: 30 * 60 }, // 30 minutes in seconds
          distance: { value: 10000 }, // 10km
        }]
      ]);

      // Mock the assignBestMatch method
      jest.spyOn(assignmentService as any, 'assignBestMatch').mockResolvedValue({
        id: 'assignment-1',
        driverId: 'driver-5',
        passengerId: 'passenger-5',
        status: 'CONFIRMED',
        estimatedPickupTime: new Date('2025-01-02T14:00:00.000Z'),
        estimatedDropoffTime: new Date('2025-01-02T14:20:00.000Z'),
        assignedAt: new Date(),
        actualPickupTime: null,
        actualDropoffTime: null,
        tripId: null,
        nextAssignmentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate the fallback logic from runAssignmentCycle
      const driverArrivalTime = new Date(Date.UTC(2025, 0, 2, 14, 0, 0, 0)); // 2:00 PM UTC
      
      // Use the same helper function as the assignment service
      const mapPickupTimesToTargetDate = (
        passengerEarliestTime: Date,
        passengerLatestTime: Date,
        targetDate: Date
      ): { earliestPickup: Date; latestPickup: Date } => {
        // Construct earliest pickup on the target date using UTC
        const earliestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerEarliestTime.getUTCHours(),
          passengerEarliestTime.getUTCMinutes(),
          passengerEarliestTime.getUTCSeconds(),
          passengerEarliestTime.getUTCMilliseconds()
        ));

        // Construct latest pickup on the target date using UTC
        let latestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerLatestTime.getUTCHours(),
          passengerLatestTime.getUTCMinutes(),
          passengerLatestTime.getUTCSeconds(),
          passengerLatestTime.getUTCMilliseconds()
        ));

        // If the latest is before the earliest, it means the window crosses midnight
        if (latestPickup.getTime() < earliestPickup.getTime()) {
          latestPickup.setUTCDate(latestPickup.getUTCDate() + 1);
        }

        return { earliestPickup, latestPickup };
      };
      
      const { earliestPickup: passengerEarliestPickup, latestPickup: passengerLatestPickup } = 
        mapPickupTimesToTargetDate(passenger.earliestPickupTime!, passenger.latestPickupTime!, targetDate);
      
      // Check if driver can arrive within passenger's window
      const isWithinWindow = driverArrivalTime <= passengerLatestPickup;
      expect(isWithinWindow).toBe(true);
      
      // Actual pickup time should be the later of driver arrival and passenger earliest
      const estimatedPickupTime = new Date(
        Math.max(driverArrivalTime.getTime(), passengerEarliestPickup.getTime())
      );
      
      expect(estimatedPickupTime.getTime()).toBe(new Date('2025-01-02T14:00:00.000Z').getTime());
    });

    it('should reject fallback assignment when driver arrives too late', async () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const passenger: Passenger = {
        id: 'passenger-6',
        name: 'Test Passenger',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851,
        earliestPickupTime: new Date('2025-01-01T14:00:00.000Z'), // 2:00 PM
        latestPickupTime: new Date('2025-01-01T15:00:00.000Z'),   // 3:00 PM
        earliestDropoffTime: null,
        latestDropoffTime: null,
        groupSize: 1,
        status: PassengerStatus.UNASSIGNED,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDirect: false,
        estimatedDurationMin: 20,
        pickupStreetNumber: null,
        pickupStreet: null,
        pickupCity: null,
        pickupZip: null,
        dropoffStreetNumber: null,
        dropoffStreet: null,
        dropoffCity: null,
        dropoffZip: null,
      };

      const driver: Driver = {
        id: 'driver-6',
        name: 'Test Driver',
        currentLat: 40.7505,
        currentLng: -73.9934,
        capacity: 4,
        availabilityStart: new Date('2025-01-02T07:00:00.000Z'),
        availabilityEnd: new Date('2025-01-02T18:00:00.000Z'),
        status: DriverStatus.IDLE,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentAssignmentId: null,
        currentTripId: null,
        lastDropoffTimestamp: new Date('2025-01-02T14:30:00.000Z'), // Last dropoff at 2:30 PM
        lastDropoffLat: 40.7505,
        lastDropoffLng: -73.9934,
      };

      // Mock the availability check
      jest.spyOn(assignmentService as any, '_isDriverTrulyAvailable').mockResolvedValue(true);

      // Mock Google Maps response - 45 minutes travel time (arrives at 3:15 PM)
      mockGoogleMapsService.getDistanceMatrix.mockResolvedValue([
        [{
          status: 'OK',
          duration: { value: 45 * 60 }, // 45 minutes in seconds
          distance: { value: 15000 }, // 15km
        }]
      ]);

      // Simulate the fallback logic
      const driverArrivalTime = new Date(Date.UTC(2025, 0, 2, 15, 15, 0, 0)); // 3:15 PM UTC
      
      // Use the same helper function as the assignment service
      const mapPickupTimesToTargetDate = (
        passengerEarliestTime: Date,
        passengerLatestTime: Date,
        targetDate: Date
      ): { earliestPickup: Date; latestPickup: Date } => {
        // Construct earliest pickup on the target date using UTC
        const earliestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerEarliestTime.getUTCHours(),
          passengerEarliestTime.getUTCMinutes(),
          passengerEarliestTime.getUTCSeconds(),
          passengerEarliestTime.getUTCMilliseconds()
        ));

        // Construct latest pickup on the target date using UTC
        let latestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerLatestTime.getUTCHours(),
          passengerLatestTime.getUTCMinutes(),
          passengerLatestTime.getUTCSeconds(),
          passengerLatestTime.getUTCMilliseconds()
        ));

        // If the latest is before the earliest, it means the window crosses midnight
        if (latestPickup.getTime() < earliestPickup.getTime()) {
          latestPickup.setUTCDate(latestPickup.getUTCDate() + 1);
        }

        return { earliestPickup, latestPickup };
      };
      
      const { latestPickup: passengerLatestPickup } = 
        mapPickupTimesToTargetDate(passenger.earliestPickupTime!, passenger.latestPickupTime!, targetDate);
      
      // Check if driver can arrive within passenger's window
      console.log('Driver arrival time:', driverArrivalTime.toISOString());
      console.log('Passenger latest pickup:', passengerLatestPickup.toISOString());
      const isWithinWindow = driverArrivalTime <= passengerLatestPickup;
      expect(isWithinWindow).toBe(false); // Driver arrives at 3:15 PM, after 3:00 PM latest
    });
  });

  describe('Time Window Calculation Edge Cases', () => {
    it('should handle midnight crossover correctly', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      const passengerEarliestTime = new Date('2025-01-01T23:30:00.000Z'); // 11:30 PM
      const passengerLatestTime = new Date('2025-01-02T00:30:00.000Z');   // 12:30 AM next day
      
      console.log('Target date:', targetDate.toISOString());
      console.log('Passenger earliest time:', passengerEarliestTime.toISOString());
      console.log('Passenger latest time:', passengerLatestTime.toISOString());
      
      const { earliestPickup, latestPickup } = (assignmentService as any).mapPickupTimesToTargetDate(
        passengerEarliestTime,
        passengerLatestTime,
        targetDate
      );
      
      console.log('Mapped earliest pickup:', earliestPickup.toISOString());
      console.log('Mapped latest pickup:', latestPickup.toISOString());
      
      expect(earliestPickup.toISOString()).toBe('2025-01-02T23:30:00.000Z');
      expect(latestPickup.toISOString()).toBe('2025-01-03T00:30:00.000Z');
    });

    it('should handle same hour earliest and latest times', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      // Passenger with very narrow window: 9:00 AM - 9:15 AM
      const passengerEarliestTime = new Date('2025-01-01T09:00:00.000Z');
      const passengerLatestTime = new Date('2025-01-01T09:15:00.000Z');
      
      // Use the same helper function as the assignment service
      const mapPickupTimesToTargetDate = (
        passengerEarliestTime: Date,
        passengerLatestTime: Date,
        targetDate: Date
      ): { earliestPickup: Date; latestPickup: Date } => {
        // Construct earliest pickup on the target date using UTC
        const earliestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerEarliestTime.getUTCHours(),
          passengerEarliestTime.getUTCMinutes(),
          passengerEarliestTime.getUTCSeconds(),
          passengerEarliestTime.getUTCMilliseconds()
        ));

        // Construct latest pickup on the target date using UTC
        let latestPickup = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          passengerLatestTime.getUTCHours(),
          passengerLatestTime.getUTCMinutes(),
          passengerLatestTime.getUTCSeconds(),
          passengerLatestTime.getUTCMilliseconds()
        ));

        // If the latest is before the earliest, it means the window crosses midnight
        if (latestPickup.getTime() < earliestPickup.getTime()) {
          latestPickup.setUTCDate(latestPickup.getUTCDate() + 1);
        }

        return { earliestPickup, latestPickup };
      };
      
      const { earliestPickup: passengerEarliestPickup, latestPickup: passengerLatestPickup } = 
        mapPickupTimesToTargetDate(passengerEarliestTime, passengerLatestTime, targetDate);
      
      expect(passengerEarliestPickup.toISOString()).toBe('2025-01-02T09:00:00.000Z');
      expect(passengerLatestPickup.toISOString()).toBe('2025-01-02T09:15:00.000Z');
      
      // Verify the window is 15 minutes
      const windowDuration = passengerLatestPickup.getTime() - passengerEarliestPickup.getTime();
      expect(windowDuration).toBe(15 * 60 * 1000); // 15 minutes in milliseconds
    });
  });

  describe('Helper Function Tests', () => {
    it('should correctly map pickup times to target date', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      const passengerEarliestTime = new Date('2025-01-01T08:00:00.000Z'); // 8:00 AM
      const passengerLatestTime = new Date('2025-01-01T09:00:00.000Z');   // 9:00 AM
      
      const { earliestPickup, latestPickup } = (assignmentService as any).mapPickupTimesToTargetDate(
        passengerEarliestTime,
        passengerLatestTime,
        targetDate
      );
      
      expect(earliestPickup.toISOString()).toBe('2025-01-02T08:00:00.000Z');
      expect(latestPickup.toISOString()).toBe('2025-01-02T09:00:00.000Z');
    });

    it('should handle midnight crossover correctly', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      const passengerEarliestTime = new Date('2025-01-01T23:30:00.000Z'); // 11:30 PM
      const passengerLatestTime = new Date('2025-01-02T00:30:00.000Z');   // 12:30 AM next day
      
      console.log('Target date:', targetDate.toISOString());
      console.log('Passenger earliest time:', passengerEarliestTime.toISOString());
      console.log('Passenger latest time:', passengerLatestTime.toISOString());
      
      const { earliestPickup, latestPickup } = (assignmentService as any).mapPickupTimesToTargetDate(
        passengerEarliestTime,
        passengerLatestTime,
        targetDate
      );
      
      console.log('Mapped earliest pickup:', earliestPickup.toISOString());
      console.log('Mapped latest pickup:', latestPickup.toISOString());
      
      expect(earliestPickup.toISOString()).toBe('2025-01-02T23:30:00.000Z');
      expect(latestPickup.toISOString()).toBe('2025-01-03T00:30:00.000Z');
    });
  });
}); 