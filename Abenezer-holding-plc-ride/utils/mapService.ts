import axios from 'axios';
import { calculateMockDistance } from 'services/test';

interface LatLng {
  lat: number;
  lng: number;
}

const USE_MOCK_MAPS = process.env.USE_MOCK_MAPS === 'true';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR = 100
export async function getTravelInfo(
  origin: LatLng,
  destination: LatLng
): Promise<{ distanceMeters: number; durationMinutes: number }> {
  if (USE_MOCK_MAPS) {
    const mockDistance = calculateMockDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );
    const duration = mockDistance * MOCK_DEGREES_TO_TRAVEL_MINUTES_FACTOR;
    return {
      distanceMeters: mockDistance * 1000,
      durationMinutes: duration,
    };
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
  const params = {
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    key: GOOGLE_MAPS_API_KEY,
    mode: 'driving',
  };

  try {
    const res = await axios.get(url, { params });
    const element = res.data.rows?.[0]?.elements?.[0];

    if (
      !element ||
      element.status !== 'OK' ||
      !element.duration ||
      !element.distance
    ) {
      throw new Error('Invalid response from Distance Matrix API');
    }

    return {
      distanceMeters: element.distance.value,
      durationMinutes: element.duration.value / 60,
    };
  } catch (err) {
    console.error(`[GoogleMapsAPI Error]`, err);
    throw new Error('Failed to get travel info from Google Maps');
  }
}
