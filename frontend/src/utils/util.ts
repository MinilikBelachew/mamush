export const getRouteAndDistance = async (origin, destination) => {
  const directionsService = new window.google.maps.DirectionsService();

  const result = await directionsService.route({
    origin,
    destination,
    travelMode: window.google.maps.TravelMode.DRIVING
  });

  const distance = result.routes[0].legs[0].distance.text; // e.g., "10.1 km"
  const duration = result.routes[0].legs[0].duration.text;

  return {
    route: result,
    distance,
    duration
  };
};
