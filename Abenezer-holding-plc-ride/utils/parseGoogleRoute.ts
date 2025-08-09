export function parseGoogleRoute(
  departureTime: Date,
  driverStart: { lat: number; lng: number },
  waypointsForAPI: any[],
  destinationStop: any,
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

  const fullStopOrder = [
    { type: 'DRIVER_ORIGIN', lat: driverStart.lat, lng: driverStart.lng },
    ...optimizedWaypoints,
    destinationStop,
  ];

  let cumulativeSeconds = 0;

  optimizedRoute.legs.forEach((leg: any, i: number) => {
    cumulativeSeconds += leg.duration.value;
    const arrivalTime = new Date(
      departureTime.getTime() + cumulativeSeconds * 1000
    );
    const stopInfo = fullStopOrder[i + 1];

    if (!stopInfo?.passengerId) return;

    const passengerId = stopInfo.passengerId;
    if (!stopEtas[passengerId]) stopEtas[passengerId] = {};

    if (stopInfo.type === 'PICKUP') {
      stopEtas[passengerId].estimatedPickupTime = arrivalTime;
    } else {
      stopEtas[passengerId].estimatedDropoffTime = arrivalTime;
    }
  });

  return {
    finalStopOrder: fullStopOrder.slice(1),
    stopEtas,
  };
}
