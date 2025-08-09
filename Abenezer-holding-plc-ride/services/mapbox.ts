import axios from 'axios';
import { apiCache } from '../utils/catch.js';

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const DISTANCE_MATRIX_URL = 'https://api.mapbox.com/directions-matrix/v1/mapbox/driving';
const DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

interface Location {
  lat: number;
  lng: number;
}

interface DistanceMatrixRequest {
  origins: Location[];
  destinations: Location[];
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

interface DistanceMatrixElement {
  duration: number; // duration in seconds
  distance: number; // distance in meters
}

interface DirectionsRequest {
  origin: Location;
  destination: Location;
  waypoints?: (Location | string)[];
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

class RateLimiter {
  private tokensPerSecond: number;
  private lastRefillTime: number;
  private maxTokensPerSecond: number;
  private refillRatePerSecond: number;

  private dailyLimit: number;
  private dailyUsage: number;
  private lastDailyReset: Date;

  constructor(maxRequestsPerSecond: number, maxRequestsPerDay: number) {
    this.maxTokensPerSecond = maxRequestsPerSecond;
    this.tokensPerSecond = maxRequestsPerSecond;
    this.refillRatePerSecond = maxRequestsPerSecond / 1000;
    this.lastRefillTime = Date.now();

    this.dailyLimit = maxRequestsPerDay;
    this.dailyUsage = 0;
    this.lastDailyReset = new Date();
    this.checkDailyReset();
  }

  private checkDailyReset(): void {
    const now = new Date();
    if (
      now.getDate() !== this.lastDailyReset.getDate() ||
      now.getMonth() !== this.lastDailyReset.getMonth() ||
      now.getFullYear() !== this.lastDailyReset.getFullYear()
    ) {
      this.dailyUsage = 0;
      this.lastDailyReset = now;
    }
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const tokensToAdd = timePassed * this.refillRatePerSecond;

    this.tokensPerSecond = Math.min(
      this.tokensPerSecond + tokensToAdd,
      this.maxTokensPerSecond
    );
    this.lastRefillTime = now;
  }

  async waitForToken(units: number = 1): Promise<void> {
    this.checkDailyReset();

    if (this.dailyUsage + units > this.dailyLimit) {
      throw new Error(
        `Daily API limit would be exceeded (${this.dailyUsage + units}/${this.dailyLimit})`
      );
    }

    this.refillTokens();

    if (this.tokensPerSecond >= units) {
      this.tokensPerSecond -= units;
      this.dailyUsage += units;
      return;
    }

    const waitTime = (units - this.tokensPerSecond) / this.refillRatePerSecond;
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    this.refillTokens();
    this.tokensPerSecond -= units;
    this.dailyUsage += units;
  }

  getDailyUsage(): { used: number; remaining: number } {
    this.checkDailyReset();
    return {
      used: this.dailyUsage,
      remaining: Math.max(0, this.dailyLimit - this.dailyUsage),
    };
  }
}

export class MapboxService {
  private apiKey: string;
  private rateLimiter: RateLimiter;
  private apiCallCount: number = 0;
  private cacheHitCount: number = 0;

  constructor() {
    if (!MAPBOX_API_KEY) {
      throw new Error('MAPBOX_API_KEY is not set in environment variables.');
    }
    this.apiKey = MAPBOX_API_KEY;
    this.rateLimiter = new RateLimiter(10, 200);
  }

  private generateCacheKey(endpoint: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${endpoint}:${sortedParams}`;
  }

  private async makeRequest<T>(url: string, params: any): Promise<T | null> {
    try {
      const apiUnits = Math.ceil(
        ((params.origins?.length || 1) * (params.destinations?.length || 1)) /
          100
      );
      await this.rateLimiter.waitForToken(apiUnits);

      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`Error during API request to ${url}:`, error);
      return null;
    }
  }

  async geocodeAddress(address: string): Promise<Location | null> {
    const cacheKey = this.generateCacheKey('geocode', { address });
    const cached = apiCache.get<Location>(cacheKey);

    if (cached) {
      this.cacheHitCount++;
      return cached;
    }

    this.apiCallCount++;
    const params = { query: address, access_token: this.apiKey };
    const response = await this.makeRequest<{
      features: any[];
    }>(GEOCODE_URL, params);

    if (response?.features.length > 0) {
      const location = response.features[0].center as Location;
      apiCache.set(cacheKey, location, 86400);
      return location;
    }

    console.warn(`Geocoding failed for address "${address}"`);
    return null;
  }
async getDistanceMatrix(
  params: DistanceMatrixRequest
): Promise<DistanceMatrixElement[][] | null> {
  const cacheKey = this.generateCacheKey('distance_matrix', params);
  const cached = apiCache.get<DistanceMatrixElement[][]>(cacheKey);

  if (cached) {
    this.cacheHitCount++;
    return cached;
  }

  this.apiCallCount++;

  const origins = params.origins;
  const destinations = params.destinations;
  const safeLimit = 25; // Matrix API supports up to 25 coordinates total

  const allPoints = [...origins, ...destinations];

  if (allPoints.length > safeLimit) {
    throw new Error(
      `Too many coordinates for Mapbox Matrix API: max 25 total (got ${allPoints.length})`
    );
  }

  // Create a de-duplicated list of unique coordinates
  const coords = allPoints.map((p) => `${p.lng},${p.lat}`);
  const coordString = coords.join(';');

  // Build index lists
  const sources = origins.map((_, i) => i).join(';');
  const destinationsIdxOffset = origins.length;
  const destinationsStr = destinations
    .map((_, i) => i + destinationsIdxOffset)
    .join(';');

  const url = `${DISTANCE_MATRIX_URL}/${coordString}`;

  try {
    const response = await axios.get(url, {
      params: {
        sources,
        destinations: destinationsStr,
        annotations: 'duration,distance',
        access_token: this.apiKey,
      },
    });

    const durations = response.data.durations || [];
    const distances = response.data.distances || [];

    // Combine durations + distances into the desired shape
    const matrix: DistanceMatrixElement[][] = durations.map((row: number[], i: number) => {
      return row.map((duration: number, j: number) => ({
        duration,
        distance: distances[i]?.[j] ?? 0,
      }));
    });

    apiCache.set(cacheKey, matrix, 1800);
    return matrix;
  } catch (error: any) {
    console.error('Error fetching Mapbox Matrix API:', error?.response?.data || error.message);
    return null;
  }
}


  async getDirections(params: DirectionsRequest): Promise<any | null> {
    const cacheKey = this.generateCacheKey('directions', params);
    const cached = apiCache.get<any>(cacheKey);

    if (cached) {
      this.cacheHitCount++;
      return cached;
    }

    this.apiCallCount++;
    const originStr = `${params.origin.lng},${params.origin.lat}`;
    const destinationStr = `${params.destination.lng},${params.destination.lat}`;
    let waypointsStr: string | undefined = undefined;

    if (params.waypoints && params.waypoints.length > 0) {
      waypointsStr = params.waypoints
        .map((wp) => (typeof wp === 'string' ? wp : `${wp.lng},${wp.lat}`))
        .join(';');
    }

    const requestParams = {
      waypoints: waypointsStr,
      access_token: this.apiKey,
    };

    const response = await this.makeRequest<{
      routes: any[];
      message?: string;
    }>(DIRECTIONS_URL, requestParams);

    if (response) {
      if (response.routes.length === 0) {
        console.warn(`Directions API request failed: No routes found`);
      }
      apiCache.set(cacheKey, response, 1800);
      return response;
    }

    console.warn(`Directions API request failed: ${response?.message || 'No response'}`);
    return null;
  }

  getApiMetrics() {
    return {
      totalCalls: this.apiCallCount,
      cacheHits: this.cacheHitCount,
      cacheHitRate:
        this.apiCallCount > 0
          ? (this.cacheHitCount / this.apiCallCount) * 100
          : 0,
    };
  }
}
