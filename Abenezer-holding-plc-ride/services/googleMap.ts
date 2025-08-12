// import axios from 'axios';
// import { apiCache } from '../utils/catch.js';

// const Maps_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
// const DISTANCE_MATRIX_URL =
//   'https://maps.googleapis.com/maps/api/distancematrix/json';
// const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

// interface Location {
//   lat: number;
//   lng: number;
// }

// interface DistanceMatrixRequest {
//   origins: Location[];
//   destinations: Location[];
//   mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
//   departure_time?: 'now' | number;
//   traffic_model?: 'best_guess' | 'pessimistic' | 'optimistic';
// }

// interface DistanceMatrixElement {
//   status: string;
//   duration: { value: number; text: string };
//   distance: { value: number; text: string };
//   duration_in_traffic?: { value: number; text: string };
// }

// interface DirectionsRequest {
//   origin: Location;
//   destination: Location;
//   waypoints?: (Location | string)[];
//   optimizeWaypoints?: boolean;
//   mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
//   departure_time?: 'now' | number;
//   traffic_model?: 'best_guess' | 'pessimistic' | 'optimistic';
// }

// class RateLimiter {
//   private tokensPerSecond: number;
//   private lastRefillTime: number;
//   private maxTokensPerSecond: number;
//   private refillRatePerSecond: number;

//   private dailyLimit: number;
//   private dailyUsage: number;
//   private lastDailyReset: Date;

//   constructor(maxRequestsPerSecond: number, maxRequestsPerDay: number) {
//     this.maxTokensPerSecond = maxRequestsPerSecond;
//     this.tokensPerSecond = maxRequestsPerSecond;
//     this.refillRatePerSecond = maxRequestsPerSecond / 1000;
//     this.lastRefillTime = Date.now();

//     this.dailyLimit = maxRequestsPerDay;
//     this.dailyUsage = 0;
//     this.lastDailyReset = new Date();
//     this.checkDailyReset();
//   }

//   private checkDailyReset(): void {
//     const now = new Date();
//     if (
//       now.getDate() !== this.lastDailyReset.getDate() ||
//       now.getMonth() !== this.lastDailyReset.getMonth() ||
//       now.getFullYear() !== this.lastDailyReset.getFullYear()
//     ) {
//       this.dailyUsage = 0;
//       this.lastDailyReset = now;
//     }
//   }

//   private refillTokens(): void {
//     const now = Date.now();
//     const timePassed = now - this.lastRefillTime;
//     const tokensToAdd = timePassed * this.refillRatePerSecond;

//     this.tokensPerSecond = Math.min(
//       this.tokensPerSecond + tokensToAdd,
//       this.maxTokensPerSecond
//     );
//     this.lastRefillTime = now;
//   }

//   async waitForToken(units: number = 1): Promise<void> {
//     this.checkDailyReset();

//     if (this.dailyUsage + units > this.dailyLimit) {
//       throw new Error(
//         `Daily API limit would be exceeded (${this.dailyUsage + units}/${this.dailyLimit})`
//       );
//     }

//     this.refillTokens();

//     if (this.tokensPerSecond >= units) {
//       this.tokensPerSecond -= units;
//       this.dailyUsage += units;
//       return;
//     }

//     const waitTime = (units - this.tokensPerSecond) / this.refillRatePerSecond;
//     await new Promise((resolve) => setTimeout(resolve, waitTime));

//     this.refillTokens();
//     this.tokensPerSecond -= units;
//     this.dailyUsage += units;
//   }

//   getDailyUsage(): { used: number; remaining: number } {
//     this.checkDailyReset();
//     return {
//       used: this.dailyUsage,
//       remaining: Math.max(0, this.dailyLimit - this.dailyUsage),
//     };
//   }
// }

// export class GoogleMapsService {
//   private apiKey: string;
//   private rateLimiter: RateLimiter;
//   private apiCallCount: number = 0;
//   private cacheHitCount: number = 0;

//   constructor() {
//     if (!Maps_API_KEY) {
//       throw new Error('Maps_API_KEY is not set in environment variables.');
//     }
//     this.apiKey = Maps_API_KEY;
//     this.rateLimiter = new RateLimiter(10, 200);
//   }

//   private generateCacheKey(endpoint: string, params: any): string {
//     const sortedParams = Object.keys(params)
//       .sort()
//       .map((key) => `${key}=${JSON.stringify(params[key])}`)
//       .join('&');
//     return `${endpoint}:${sortedParams}`;
//   }

//   private async makeRequest<T>(url: string, params: any): Promise<T | null> {
//     try {
//       const apiUnits = Math.ceil(
//         ((params.origins?.length || 1) * (params.destinations?.length || 1)) /
//           100
//       );
//       await this.rateLimiter.waitForToken(apiUnits);

//       const response = await axios.get(url, { params });
//       return response.data;
//     } catch (error) {
//       console.error(`Error during API request to ${url}:`, error);
//       return null;
//     }
//   }

//   async geocodeAddress(address: string): Promise<Location | null> {
//     const cacheKey = this.generateCacheKey('geocode', { address });
//     const cached = apiCache.get<Location>(cacheKey);

//     if (cached) {
//       this.cacheHitCount++;
//       return cached;
//     }

//     this.apiCallCount++;
//     const params = { address, key: this.apiKey };
//     const response = await this.makeRequest<{
//       status: string;
//       results: any[];
//       error_message?: string;
//     }>(GEOCODE_URL, params);

//     if (response?.status === 'OK' && response.results.length > 0) {
//       const location = response.results[0].geometry.location as Location;
//       apiCache.set(cacheKey, location, 86400);
//       return location;
//     }

//     console.warn(
//       `Geocoding failed for address "${address}": ${response?.status || 'No response'} - ${response?.error_message || ''}`
//     );
//     return null;
//   }

//   async getDistanceMatrix(
//     params: DistanceMatrixRequest
//   ): Promise<DistanceMatrixElement[][] | null> {
//     const cacheKey = this.generateCacheKey('distance_matrix', params);
//     const cached = apiCache.get<DistanceMatrixElement[][]>(cacheKey);

//     if (cached) {
//       this.cacheHitCount++;
//       return cached;
//     }

//     this.apiCallCount++;
//     const origins = params.origins;
//     const destinations = params.destinations;
//     const safeBatchLimit = 25;
//     const allResults: DistanceMatrixElement[][] = [];

//     for (const origin of origins) {
//       const originStr = `${origin.lat},${origin.lng}`;
//       const row: DistanceMatrixElement[] = [];

//       for (let i = 0; i < destinations.length; i += safeBatchLimit) {
//         const destinationBatch = destinations.slice(i, i + safeBatchLimit);
//         const destinationsStr = destinationBatch
//           .map((d) => `${d.lat},${d.lng}`)
//           .join('|');

//         try {
//           const response = await axios.get(DISTANCE_MATRIX_URL, {
//             params: {
//               origins: originStr,
//               destinations: destinationsStr,
//               mode: params.mode || 'driving',
//               departure_time: params.departure_time || 'now',
//               traffic_model: params.traffic_model || 'best_guess',
//               key: this.apiKey,
//             },
//           });

//           if (response.data.status === 'OK') {
//             const elements = response.data.rows[0]?.elements || [];
//             row.push(...elements);
//           } else {
//             console.warn(
//               `Distance Matrix API batch request failed: ${response.data.status || 'No response'} - ${response.data.error_message || ''}`
//             );
//           }
//         } catch (error: any) {
//           if (error.message.includes('Daily API limit exceeded')) {
//             console.error('Distance Matrix request blocked by daily limit');
//             return null;
//           }
//           console.error('Error fetching distance matrix batch:', error);
//         }
//       }

//       allResults.push(row);
//     }

//     if (allResults.length > 0) {
//       apiCache.set(cacheKey, allResults, 1800);
//     }

//     return allResults.length > 0 ? allResults : null;
//   }

//   async getDirections(params: DirectionsRequest): Promise<any | null> {
//     const cacheKey = this.generateCacheKey('directions', params);
//     const cached = apiCache.get<any>(cacheKey);

//     if (cached) {
//       this.cacheHitCount++;
//       return cached;
//     }

//     this.apiCallCount++;
//     const originStr = `${params.origin.lat},${params.origin.lng}`;
//     const destinationStr = `${params.destination.lat},${params.destination.lng}`;
//     let waypointsStr: string | undefined = undefined;

//     if (params.waypoints && params.waypoints.length > 0) {
//       waypointsStr = params.waypoints
//         .map((wp) => (typeof wp === 'string' ? wp : `${wp.lat},${wp.lng}`))
//         .join('|');
//       if (params.optimizeWaypoints) {
//         waypointsStr = `optimize:true|${waypointsStr}`;
//       }
//     }

//     const requestParams = {
//       origin: originStr,
//       destination: destinationStr,
//       waypoints: waypointsStr,
//       mode: params.mode || 'driving',
//       departure_time: params.departure_time || 'now',
//       traffic_model: params.traffic_model || 'best_guess',
//       key: this.apiKey,
//     };

//     const response = await this.makeRequest<{
//       status: string;
//       routes: any[];
//       error_message?: string;
//     }>(DIRECTIONS_URL, requestParams);

//     // --- THIS IS THE FIX ---
//     // Instead of returning just the first route, we return the whole response object.
//     // This allows the calling function to safely check the status and routes array.
//     if (response) {
//       if (response.status !== 'OK') {
//         console.warn(
//           `Directions API request failed: ${response.status} - ${response.error_message || ''}`
//         );
//       }
//       apiCache.set(cacheKey, response, 1800);
//       return response;
//     }

//     console.warn(
//       `Directions API request failed: No response from makeRequest function.`
//     );
//     return null;
//   }

//   async getTravelTimeInSeconds({
//     origin,
//     destination,
//     departure_time,
//   }: {
//     origin: Location;
//     destination: Location;
//     departure_time?: number;
//   }): Promise<number | null> {
//     const matrix = await this.getDistanceMatrix({
//       origins: [origin],
//       destinations: [destination],
//       mode: 'driving',
//       departure_time: departure_time || 'now',
//       traffic_model: 'best_guess',
//     });
//     if (matrix && matrix[0] && matrix[0][0] && matrix[0][0].status === 'OK') {
//       return matrix[0][0].duration.value;
//     }
//     return null;
//   }

//   getApiMetrics() {
//     return {
//       totalCalls: this.apiCallCount,
//       cacheHits: this.cacheHitCount,
//       cacheHitRate:
//         this.apiCallCount > 0
//           ? (this.cacheHitCount / this.apiCallCount) * 100
//           : 0,
//       dailyUsage: this.rateLimiter.getDailyUsage(),
//     };
//   }
// }
