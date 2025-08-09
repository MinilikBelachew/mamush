import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
export interface Location {
  lat: number;
  lng: number;
}

export function haversineDistance(
  coords1: Location,
  coords2: Location
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coords2.lat - coords1.lat);
  const dLon = deg2rad(coords2.lng - coords1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1.lat)) *
      Math.cos(deg2rad(coords2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Parses a time string (HH:MM) and sets it on a given date (defaults to today).
 * Important: Ensure the date portion is correctly handled for your business logic,
 * especially if pickups can be scheduled for future dates.
 */
export function parseTime(
  timeStr: string,
  referenceDate: Date = new Date()
): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(referenceDate);
  newDate.setHours(hours, minutes, 0, 0); // Set seconds and milliseconds to 0
  return newDate;
}

// Helper to check if a time is within a window (exclusive of start, inclusive of end for latest)
export function isTimeWithinWindow(
  timeToCheck: Date,
  earliest?: Date | null,
  latest?: Date | null
): boolean {
  if (earliest && timeToCheck < earliest) {
    return false;
  }
  if (latest && timeToCheck > latest) {
    return false;
  }
  return true;
}

export function parseOptionalInt(value: string | undefined): number | null {
  const parsed = parseInt(value ?? '');
  return isNaN(parsed) ? null : parsed;
}

// function parseTime(value: string | undefined): Date | null {
//   return value ? new Date(value) : null;
// }

export function logInfo(message: string) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

export function logWarn(message: string) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
}

export function logError(message: string, error: unknown) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
}
export async function geocodeAddress(
  streetNumber: string,
  street: string,
  city: string,
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  const fullAddress = `${streetNumber} ${street}, ${city}, ${zip}`;
  try {
    const response = await axios.get(
      'https://api.distancematrix.ai/maps/api/geocode/json',
      {
        params: {
          address: fullAddress,
          key: process.env.DISTANCE_MATRIX_AI_KEY,
        },
        timeout: 4000,
      }
    );

    // Log raw response for debug purposes
    console.log(
      `[DEBUG] Geocode response for "${fullAddress}":`,
      JSON.stringify(response.data, null, 2)
    );

    const result = response.data.result;

    if (
      !Array.isArray(result) ||
      !result.length ||
      !result[0].geometry?.location
    ) {
      logWarn(`[WARN] No geocode results for address: ${fullAddress}`);
      return null;
    }

    const location = result[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    logError(`[ERROR] Geocoding API error for address: ${fullAddress}`, error);
    return null;
  }
}

export async function getDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number | null> {
  try {
    const response = await axios.get(
      'https://api.distancematrix.ai/maps/api/distancematrix/json',
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: process.env.DISTANCE_MATRIX_API_KEY,
        },
        timeout: 4000,
      }
    );

    if (response.data.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      logWarn(
        `[WARN] Distance API returned non-OK status for origin ${origin} to destination ${destination}`
      );
      return null;
    }

    const distance = response.data.rows[0].elements[0].distance.value; // in meters
    return distance / 1000; // convert to kilometers
  } catch (error) {
    logError(
      `[ERROR] Distance API error for origin ${origin} to destination ${destination}`,
      error
    );
    return null;
  }
}

/*
// Unused imports commented out
import {
  Client as GoogleMapsClient,
  TravelMode,
  TrafficModel,
  DirectionsRequest,
  DirectionsResponseData,
  Distance,
  Duration,
  DirectionsStep,
} from '@googlemaps/google-maps-services-js';

interface RouteLegDetails {
  originAddress: string;
  destinationAddress: string;
  distance: Distance;
  duration: Duration;
  durationInTraffic?: Duration | null;
  polyline: string;
  steps: Array<{
    html_instructions: string;
    distance: Distance;
    duration: Duration;
    polyline?: string;
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
  }>;
  summary: string;
}
*/

/*
// Unused function - commented out
async function getDetailedRoute(
  googleMapsClient: GoogleMapsClient,
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string,
  departureTimeInput?: Date | 'now' | number
): Promise<RouteLegDetails | null> {
  try {
    const requestParams: DirectionsRequest['params'] = {
      origin:
        typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
      destination:
        typeof destination === 'string'
          ? destination
          : `${destination.lat},${destination.lng}`,
      mode: TravelMode.driving,
      provideRouteAlternatives: false,
    };

    if (departureTimeInput) {
      if (departureTimeInput instanceof Date) {
        requestParams.departure_time = Math.floor(
          departureTimeInput.getTime() / 1000
        );
      } else {
        requestParams.departure_time = departureTimeInput; // "now" or seconds
      }
      // When departure_time is set, traffic_model is recommended.
      // 'best_guess' is a good default for predicting travel time.
      requestParams.traffic_model = TrafficModel.best_guess;
    }

    const response = await googleMapsClient.directions({
      params: requestParams,
    });
    const responseData: DirectionsResponseData = response.data;

    if (responseData.status === 'OK' && responseData.routes.length > 0) {
      const route = responseData.routes[0]; // Primary route
      if (route.legs.length > 0) {
        const leg = route.legs[0];
        return {
          originAddress: leg.start_address,
          destinationAddress: leg.end_address,
          distance: leg.distance,
          duration: leg.duration, // Duration without traffic unless departure_time is past/not used
          durationInTraffic: leg.duration_in_traffic || null, // Duration with traffic if available
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: DirectionsStep) => ({
            html_instructions: step.html_instructions,
            distance: step.distance,
            duration: step.duration,
            polyline: step.polyline?.points,
            start_location: step.start_location,
            end_location: step.end_location,
          })),
          summary: route.summary,
          // fullLegData: leg, // Uncomment if you want to return the raw leg data
          // fullRouteData: route, // Uncomment for raw route data
        };
      }
    }
    console.warn(
      `Directions API returned status ${responseData.status} or no routes for journey. Origin: ${JSON.stringify(origin)}, Destination: ${JSON.stringify(destination)}`
    );
    return null;
  } catch (error: any) {
    console.error(
      `Error fetching directions. Origin: ${JSON.stringify(origin)}, Destination: ${JSON.stringify(destination)}:`,
      error.message || error
    );
    return null;
  }
}
*/

import polyline from 'polyline-encoded';

export function isLocationNearPolyline(
  point: { lat: number; lng: number },
  encodedPolyline: string,
  radiusMeters: number
): boolean {
  const path = polyline.decode(encodedPolyline); // Decodes to a [[lat, lng], ...] array

  // Use haversineDistance for distance calculation (returns km, so convert radiusMeters to km)
  const radiusKm = radiusMeters / 1000;
  for (const polyPoint of path) {
    const distance = haversineDistance(
      { lat: point.lat, lng: point.lng },
      { lat: polyPoint[0], lng: polyPoint[1] }
    );
    if (distance <= radiusKm) {
      return true;
    }
  }
  return false;
}
