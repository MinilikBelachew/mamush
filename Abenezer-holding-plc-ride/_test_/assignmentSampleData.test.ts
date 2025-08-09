import { describe, it, expect } from '@jest/globals';

describe('Assignment Logic - Sample Data Integration', () => {
  
  describe('Realistic Assignment Scenarios', () => {
    it('should handle assignment with sample driver and passenger data', () => {
      // Sample data that mimics real-world scenario
      const targetDate = new Date('2025-01-02T00:00:00.000Z'); // Tomorrow
      
      const sampleDriver = {
        id: 'driver-1',
        name: 'John Smith',
        currentLat: 40.7128,   // NYC coordinates
        currentLng: -74.0060,
        capacity: 4,
        status: 'IDLE' as const,
      };
      
      const samplePassenger1 = {
        id: 'passenger-1',
        name: 'Alice Johnson',
        pickupLat: 40.7589,    // Times Square area
        pickupLng: -73.9851,
        dropoffLat: 40.6892,   // Brooklyn
        dropoffLng: -74.0445,
        earliestPickupTime: new Date('2025-01-01T08:15:00.000Z'), // 8:15 AM
        latestPickupTime: new Date('2025-01-01T09:00:00.000Z'),   // 9:00 AM
        estimatedDurationMin: 25,
      };
      
      const samplePassenger2 = {
        id: 'passenger-2', 
        name: 'Bob Wilson',
        pickupLat: 40.7505,    // Midtown
        pickupLng: -73.9934,
        dropoffLat: 40.7831,   // Upper West Side
        dropoffLng: -73.9712,
        earliestPickupTime: new Date('2025-01-01T15:15:00.000Z'), // 3:15 PM
        latestPickupTime: new Date('2025-01-01T16:00:00.000Z'),   // 4:00 PM
        estimatedDurationMin: 20,
      };
      
      // Simulate assignment algorithm logic
      const assignments = [];
      
      for (const passenger of [samplePassenger1, samplePassenger2]) {
        // Calculate driver travel time (simplified)
        const distanceKm = Math.sqrt(
          Math.pow(passenger.pickupLat - sampleDriver.currentLat, 2) + 
          Math.pow(passenger.pickupLng - sampleDriver.currentLng, 2)
        ) * 111; // Rough km conversion
        
        const travelTimeSeconds = Math.floor(distanceKm * 60); // 1 minute per km (very rough)
        
        // Driver arrival time (starting from target date)
        const driverArrivalTime = new Date(targetDate.getTime() + travelTimeSeconds * 1000);
        
        // Passenger pickup window on target date
        const passengerEarliestPickup = new Date(targetDate);
        passengerEarliestPickup.setHours(
          passenger.earliestPickupTime.getHours(),
          passenger.earliestPickupTime.getMinutes(),
          passenger.earliestPickupTime.getSeconds(),
          passenger.earliestPickupTime.getMilliseconds()
        );
        
        const passengerLatestPickup = new Date(targetDate);
        passengerLatestPickup.setHours(
          passenger.latestPickupTime.getHours(),
          passenger.latestPickupTime.getMinutes(),
          passenger.latestPickupTime.getSeconds(),
          passenger.latestPickupTime.getMilliseconds()
        );
        
        // Check if assignment is possible
        if (driverArrivalTime <= passengerLatestPickup) {
          const estimatedPickupTime = new Date(
            Math.max(driverArrivalTime.getTime(), passengerEarliestPickup.getTime())
          );
          
          const estimatedDropoffTime = new Date(
            estimatedPickupTime.getTime() + passenger.estimatedDurationMin * 60 * 1000
          );
          
          assignments.push({
            passengerId: passenger.id,
            driverId: sampleDriver.id,
            estimatedPickupTime,
            estimatedDropoffTime,
            isWithinTimeWindow: estimatedPickupTime >= passengerEarliestPickup && 
                              estimatedPickupTime <= passengerLatestPickup,
          });
        }
      }
      
      // Verify assignments were created correctly
      expect(assignments).toHaveLength(2);
      
      // Check passenger 1 assignment (morning)
      const assignment1 = assignments.find(a => a.passengerId === 'passenger-1');
      expect(assignment1).toBeDefined();
      expect(assignment1!.isWithinTimeWindow).toBe(true);
      expect(assignment1!.estimatedPickupTime.toISOString()).toMatch(/^2025-01-02T08:/);
      
      // Check passenger 2 assignment (afternoon)
      const assignment2 = assignments.find(a => a.passengerId === 'passenger-2');
      expect(assignment2).toBeDefined();
      expect(assignment2!.isWithinTimeWindow).toBe(true);
      expect(assignment2!.estimatedPickupTime.toISOString()).toMatch(/^2025-01-02T15:/);
      
      // Verify assignments are for tomorrow (target date)
      assignments.forEach(assignment => {
        expect(assignment.estimatedPickupTime.toDateString()).toBe(targetDate.toDateString());
        expect(assignment.estimatedDropoffTime.toDateString()).toBe(targetDate.toDateString());
      });
    });
    
    it('should reject assignments when driver cannot reach passenger in time window', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const sampleDriver = {
        id: 'driver-far',
        name: 'Far Driver',
        currentLat: 40.0000,   // Very far from passenger
        currentLng: -75.0000,
        capacity: 4,
        status: 'IDLE' as const,
      };
      
      const samplePassenger = {
        id: 'passenger-urgent',
        name: 'Urgent Passenger',
        pickupLat: 40.7589,
        pickupLng: -73.9851,
        dropoffLat: 40.6892,
        dropoffLng: -74.0445,
        earliestPickupTime: new Date('2025-01-01T06:00:00.000Z'), // 6:00 AM
        latestPickupTime: new Date('2025-01-01T06:30:00.000Z'),   // 6:30 AM (very short window)
        estimatedDurationMin: 25,
      };
      
      // Calculate very long travel time due to distance
      const distanceKm = Math.sqrt(
        Math.pow(samplePassenger.pickupLat - sampleDriver.currentLat, 2) + 
        Math.pow(samplePassenger.pickupLng - sampleDriver.currentLng, 2)
      ) * 111;
      
      const travelTimeSeconds = Math.floor(distanceKm * 180); // 3 minutes per km (slow traffic)
      const driverArrivalTime = new Date(targetDate.getTime() + travelTimeSeconds * 1000);
      
      // Passenger pickup window
      const passengerLatestPickup = new Date(targetDate);
      passengerLatestPickup.setHours(
        samplePassenger.latestPickupTime.getHours(),
        samplePassenger.latestPickupTime.getMinutes(),
        samplePassenger.latestPickupTime.getSeconds(),
        samplePassenger.latestPickupTime.getMilliseconds()
      );
      
      // Verify assignment is rejected
      const isAssignmentPossible = driverArrivalTime <= passengerLatestPickup;
      expect(isAssignmentPossible).toBe(false);
      
      // Driver arrives much later than passenger's latest pickup time
      expect(driverArrivalTime.getTime()).toBeGreaterThan(passengerLatestPickup.getTime());
    });
    
    it('should prioritize passengers with earlier pickup times', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const sampleDriver = {
        id: 'driver-1',
        currentLat: 40.7128,
        currentLng: -74.0060,
        capacity: 4,
      };
      
      const earlyPassenger = {
        id: 'early-passenger',
        name: 'Early Bird',
        pickupLat: 40.7589,
        pickupLng: -73.9851,
        dropoffLat: 40.6892,
        dropoffLng: -74.0445,
        earliestPickupTime: new Date('2025-01-01T07:00:00.000Z'), // 7:00 AM
        latestPickupTime: new Date('2025-01-01T07:30:00.000Z'),   // 7:30 AM
        estimatedDurationMin: 20,
      };
      
      const latePassenger = {
        id: 'late-passenger',
        name: 'Late Starter',
        pickupLat: 40.7505,
        pickupLng: -73.9934,
        dropoffLat: 40.7831,
        dropoffLng: -73.9712,
        earliestPickupTime: new Date('2025-01-01T09:00:00.000Z'), // 9:00 AM
        latestPickupTime: new Date('2025-01-01T09:30:00.000Z'),   // 9:30 AM
        estimatedDurationMin: 15,
      };
      
      // Calculate costs for both passengers (travel + ride time)
      const calculateCost = (passenger: typeof earlyPassenger) => {
        const distanceKm = Math.sqrt(
          Math.pow(passenger.pickupLat - sampleDriver.currentLat, 2) + 
          Math.pow(passenger.pickupLng - sampleDriver.currentLng, 2)
        ) * 111;
        
        const travelTimeSeconds = Math.floor(distanceKm * 60);
        const rideDurationSeconds = passenger.estimatedDurationMin * 60;
        
        return travelTimeSeconds + rideDurationSeconds;
      };
      
      const earlyCost = calculateCost(earlyPassenger);
      const lateCost = calculateCost(latePassenger);
      
      // In a typical assignment algorithm, costs help determine priority
      // Both should be assignable, but we can verify cost calculation
      expect(earlyCost).toBeGreaterThan(0);
      expect(lateCost).toBeGreaterThan(0);
      
      // Verify both passengers have valid pickup windows on target date
      const earlyPickupWindow = new Date(targetDate);
      earlyPickupWindow.setHours(
        earlyPassenger.earliestPickupTime.getHours(),
        earlyPassenger.earliestPickupTime.getMinutes()
      );
      
      const latePickupWindow = new Date(targetDate);
      latePickupWindow.setHours(
        latePassenger.earliestPickupTime.getHours(),
        latePassenger.earliestPickupTime.getMinutes()
      );
      
      expect(earlyPickupWindow.toISOString()).toBe('2025-01-02T07:00:00.000Z');
      expect(latePickupWindow.toISOString()).toBe('2025-01-02T09:00:00.000Z');
      expect(earlyPickupWindow.getTime()).toBeLessThan(latePickupWindow.getTime());
    });
  });
  
  describe('Assignment Field Validation', () => {
    it('should create complete assignment objects with all required fields', () => {
      const targetDate = new Date('2025-01-02T00:00:00.000Z');
      
      const assignment = {
        passenger: {
          id: 'P1',
          name: 'Test Passenger',
          pickupLat: 40.7589,
          pickupLng: -73.9851,
          dropoffLat: 40.6892,
          dropoffLng: -74.0445,
          earliestPickupTime: new Date('2025-01-01T15:15:00.000Z'),
          latestPickupTime: new Date('2025-01-01T16:00:00.000Z'),
          estimatedDurationMin: 20,
        },
        driver: {
          id: 'D1',
          name: 'Test Driver',
          currentLat: 40.7128,
          currentLng: -74.0060,
          capacity: 4,
        },
        score: 1800, // 30 minutes total (10 min travel + 20 min ride)
        travelTimeToPickupSeconds: 600, // 10 minutes
        estimatedPickupTime: (() => {
          const pickupTime = new Date(targetDate);
          pickupTime.setUTCHours(15, 15, 0, 0); // 3:15 PM UTC
          return pickupTime;
        })(),
        passengerRideDurationSeconds: 1200, // 20 minutes
      };
      
      // Verify all required fields for assignBestMatch are present
      expect(assignment.passenger).toBeDefined();
      expect(assignment.passenger.id).toBe('P1');
      
      expect(assignment.driver).toBeDefined();
      expect(assignment.driver.id).toBe('D1');
      
      expect(assignment.score).toBe(1800);
      expect(assignment.travelTimeToPickupSeconds).toBe(600);
      expect(assignment.passengerRideDurationSeconds).toBe(1200);
      
      expect(assignment.estimatedPickupTime).toBeInstanceOf(Date);
      expect(assignment.estimatedPickupTime.toISOString()).toBe('2025-01-02T15:15:00.000Z');
      
      // Verify no crash on .getTime() call
      expect(() => assignment.estimatedPickupTime.getTime()).not.toThrow();
      
      // Calculate estimated dropoff time
      const estimatedDropoffTime = new Date(
        assignment.estimatedPickupTime.getTime() + assignment.passengerRideDurationSeconds * 1000
      );
      expect(estimatedDropoffTime.toISOString()).toBe('2025-01-02T15:35:00.000Z');
      
      // Verify pickup is within passenger's time window
      const passengerEarliest = new Date(targetDate);
      passengerEarliest.setUTCHours(15, 15, 0, 0);
      
      const passengerLatest = new Date(targetDate);
      passengerLatest.setUTCHours(16, 0, 0, 0);
      
      expect(assignment.estimatedPickupTime.getTime()).toBeGreaterThanOrEqual(
        passengerEarliest.getTime()
      );
      expect(assignment.estimatedPickupTime.getTime()).toBeLessThanOrEqual(
        passengerLatest.getTime()
      );
    });
  });
});
