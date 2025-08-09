import { describe, it, expect } from '@jest/globals';
import { parseGoogleRoute } from '../utils/parseGoogleRoute';

describe('parseGoogleRoute', () => {
  const driverStart = { lat: 0, lng: 0 };
  const waypointsForAPI = [
    { type: 'PICKUP', passengerId: 'A', lat: 1, lng: 1 },
    { type: 'PICKUP', passengerId: 'B', lat: 2, lng: 2 },
    { type: 'DROPOFF', passengerId: 'B', lat: 3, lng: 3 },
    { type: 'DROPOFF', passengerId: 'A', lat: 4, lng: 4 },
  ];
  const destinationStop = { type: 'DROPOFF', passengerId: 'A', lat: 4, lng: 4 };
  const optimizedRouteMock = {
    waypoint_order: [1, 0, 2, 3],
    legs: [
      { duration: { value: 300 } }, // 5 min
      { duration: { value: 240 } }, // 4 min
      { duration: { value: 600 } }, // 10 min
      { duration: { value: 720 } }, // 12 min
    ],
  };
  const departure = new Date('2025-06-26T10:00:00Z');

  it('should return correct ETAs and final stop order', () => {
    const { finalStopOrder, stopEtas } = parseGoogleRoute(
      departure,
      driverStart,
      waypointsForAPI,
      destinationStop,
      optimizedRouteMock
    );

    expect(finalStopOrder.map((s) => `${s.type}-${s.passengerId}`)).toEqual([
      'PICKUP-B',
      'PICKUP-A',
      'DROPOFF-B',
      'DROPOFF-A',
      'DROPOFF-A',
    ]);

    expect(stopEtas['B'].estimatedPickupTime?.toISOString()).toBe(
      '2025-06-26T10:05:00.000Z'
    );
    expect(stopEtas['A'].estimatedPickupTime?.toISOString()).toBe(
      '2025-06-26T10:09:00.000Z'
    );
    expect(stopEtas['B'].estimatedDropoffTime?.toISOString()).toBe(
      '2025-06-26T10:19:00.000Z'
    );
    expect(stopEtas['A'].estimatedDropoffTime?.toISOString()).toBe(
      '2025-06-26T10:31:00.000Z'
    );
  });
});
