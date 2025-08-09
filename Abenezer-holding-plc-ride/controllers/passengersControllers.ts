import { Request, Response } from "express";
import axios from "axios";
import csv from "csv-parser";
import fs, { unlinkSync } from "fs";
import { prisma } from "@utils/prisma.js";
import { Transform } from 'stream';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
// geocodeAddress, logError, logInfo, logWarn, parseOptionalInt are not used in the provided snippet,
// so they are commented out or assumed to be available if needed elsewhere.
// import { geocodeAddress, logError, logInfo, logWarn, parseOptionalInt } from "@utils/helpers";


// Helper function for case-insensitive column access
function getColumnValue(row: any, potentialColumnNames: string[]): string | undefined {
    // Convert all row keys to lowercase for efficient lookup
    const lowercasedRowKeys = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
    }, {} as { [key: string]: string });

    for (const name of potentialColumnNames) {
        const normalizedName = name.toLowerCase().trim();
        if (lowercasedRowKeys.hasOwnProperty(normalizedName)) {
            return lowercasedRowKeys[normalizedName];
        }
    }
    return undefined; // Return undefined if no matching column is found
}


export const bulkRegisterPassengersFromCSV = async (
    req: Request,
    res: Response
) => {
    const startTime = performance.now();
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "CSV file is required" });
        }

        const passengers: any[] = [];

        // Updated getLocation function to use Mapbox Geocoding API
        const getLocation = async (
            streetNumber: string,
            street: string,
            city: string,
            zip: string
        ) => {
            try {
                const fullAddress = `${streetNumber} ${street}, ${city}, ${zip}`;
                // Mapbox Geocoding API endpoint
                // Note: The query string should be URL-encoded for safety.
                const encodedAddress = encodeURIComponent(fullAddress);
                const response = await axios.get(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
                    {
                        params: {
                            access_token: process.env.MAPBOX_API_KEY, // Use Mapbox API key
                            limit: 1, // Get only the most relevant result
                        },
                        timeout: 5000,
                    }
                );

                // Check if results exist and have geometry
                if (!response.data.features || response.data.features.length === 0) {
                    console.log("No results for address:", fullAddress);
                    return null;
                }

                // Mapbox returns coordinates as [longitude, latitude] in features[0].center
                const [lng, lat] = response.data.features[0].center;
                return { lat, lng };
            } catch (err) {
                console.error("Geocoding error with Mapbox:", err);
                return null;
            }
        };

        const processFile = () =>
            new Promise<any[]>((resolve, reject) => {
                const results: any[] = [];
                const stream = fs
                    .createReadStream(file.path)
                    .pipe(
                        csv({
                            separator: ",", // Correct separator based on abebech.csv
                            columns: true, // Automatically detect headers from the first row of the CSV
                            skip_empty_lines: true, // Skip any empty rows in the CSV
                            trim: true // Trim whitespace from parsed values
                        })
                    )
                    .on("data", (row) => {
                        // Log the actual row content to help debug column names if issues persist
                        // console.log("Parsed row (actual headers):", row);
                        passengers.push(row);
                    })
                    .on("error", (err) => {
                        fs.unlinkSync(file.path);
                        reject(err);
                    })
                    .on("end", async () => {
                        try {
                            console.log(`Processing ${passengers.length} passengers`); // Debug logging
                            for (let i = 0; i < passengers.length; i++) {
                                const row = passengers[i];
                                console.log(`Processing row ${i + 1}/${passengers.length}`); // Debug logging
                                try {
                                    // Use the getColumnValue helper for robust access
                                    const pickupStreetNumber = getColumnValue(row, ["Pick-up Street Number", "Pickup Street Number", "Pick Up Street Number"]) || '';
                                    const pickupStreet = getColumnValue(row, ["Pick-up Street", "Pickup Street", "Pick Up Street"]) || '';
                                    const pickupCity = getColumnValue(row, ["Pick-up City", "Pickup City", "Pick Up City"]) || '';
                                    const pickupZip = getColumnValue(row, ["Pick-up Postal Code", "Pickup Postal Code", "Pick-up ZIP", "Pickup ZIP", "Pick Up Postal Code", "Pick Up ZIP"]) || '';

                                    const dropoffStreetNumber = getColumnValue(row, ["Drop-off Street Number", "Dropoff Street Number", "Drop Off Street Number"]) || '';
                                    const dropoffStreet = getColumnValue(row, ["Drop-off Street", "Dropoff Street", "Drop Off Street"]) || '';
                                    const dropoffCity = getColumnValue(row, ["Drop-off City", "Dropoff City", "Drop Off City"]) || '';
                                    const dropoffZip = getColumnValue(row, ["Drop-off Postal Code", "Dropoff Postal Code", "Drop-off ZIP", "Dropoff ZIP", "Drop Off Postal Code", "Drop Off ZIP"]) || '';

                                    const passengerName = getColumnValue(row, ["Passenger Name", "Name", "Full Name"]) || '';
                                    const estimatedDurationMinStr = getColumnValue(row, ["Direct Estimated Duration (minutes)", "Estimated Duration Minutes", "Duration Minutes"]);
                                    const earliestPickupTimeStr = getColumnValue(row, ["Earliest Pick-up", "Earliest Pickup Time", "Earliest Pick Up"]);
                                    const latestPickupTimeStr = getColumnValue(row, ["Latest Pick-up Time", "Latest Pickup Time", "Latest Pick Up"]);
                                    const earliestDropoffTimeStr = getColumnValue(row, ["Earliest Drop-off Time", "Earliest Dropoff Time", "Earliest Drop Off"]);
                                    const latestDropoffTimeStr = getColumnValue(row, ["Latest Drop-off Time", "Latest Dropoff Time", "Latest Drop Off"]);


                                    const [pickupLocation, dropoffLocation] = await Promise.all([
                                        getLocation(
                                            pickupStreetNumber,
                                            pickupStreet,
                                            pickupCity,
                                            pickupZip
                                        ),
                                        getLocation(
                                            dropoffStreetNumber,
                                            dropoffStreet,
                                            dropoffCity,
                                            dropoffZip
                                        ),
                                    ]);

                                    if (!pickupLocation || !dropoffLocation) {
                                        console.log("Skipping row due to missing location data or geocoding failure:", row);
                                        continue; // Skip this row if geocoding fails
                                    }

                                    const estimatedDurationMin = estimatedDurationMinStr ? parseFloat(estimatedDurationMinStr) : null;


                                    const passenger = await prisma.passenger.create({
                                        data: {
                                            name: passengerName,
                                            isDirect: true,
                                            estimatedDurationMin: estimatedDurationMin,
                                            earliestPickupTime: parseTime(earliestPickupTimeStr),
                                            latestPickupTime: parseTime(latestPickupTimeStr),
                                            earliestDropoffTime: parseTime(earliestDropoffTimeStr),
                                            latestDropoffTime: parseTime(latestDropoffTimeStr),

                                            pickupStreetNumber: pickupStreetNumber,
                                            pickupStreet: pickupStreet,
                                            pickupCity: pickupCity,
                                            pickupZip: pickupZip,
                                            dropoffStreetNumber: dropoffStreetNumber,
                                            dropoffStreet: dropoffStreet,
                                            dropoffCity: dropoffCity,
                                            dropoffZip: dropoffZip,
                                            pickupLat: pickupLocation.lat,
                                            pickupLng: pickupLocation.lng,
                                            dropoffLat: dropoffLocation.lat,
                                            dropoffLng: dropoffLocation.lng,
                                        },
                                    });
                                    console.log("Created passenger:", passenger.id); // Debug logging
                                    results.push(passenger);
                                } catch (innerErr) {
                                    console.error("Error processing row:", row, innerErr);
                                }
                            }
                            fs.unlinkSync(file.path);
                            resolve(results);
                        } catch (err) {
                            fs.unlinkSync(file.path);
                            reject(err);
                        }
                    });
            });

        const results = await processFile();


        const endTime = performance.now(); // ⏱️ End timing
        const seconds = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`⏱️ Bulk registration took ${seconds} seconds`)
        return res.status(201).json({
            message: "Bulk registration completed",
            count: results.length,
            passengers: results,
            durationInSeconds: seconds,

        });
    } catch (err) {
        console.error(err);
        if (req.file?.path) {
            fs.unlinkSync(req.file.path);
        }
        return res
            .status(500)
            .json({ message: "Internal server error during CSV import" });
    }
};

// Modified parseTime to handle invalid/empty time strings more gracefully
function parseTime(timeString: string | undefined | null): Date | null {
    if (!timeString) {
        return null; // Return null for empty or undefined strings
    }

    // Attempt to parse "HH:MM" format (e.g., "9:59")
    const timeParts = timeString.split(":");
    if (timeParts.length === 2 && !isNaN(parseInt(timeParts[0])) && !isNaN(parseInt(timeParts[1]))) {
        const [hours, minutes] = timeParts;

        // --- MODIFICATION STARTS HERE ---
        const tomorrow = new Date(); // Get today's date and time
        tomorrow.setDate(tomorrow.getDate() + 1); // Add one day to make it tomorrow's date
        // --- MODIFICATION ENDS HERE ---

        tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Set hours, minutes, seconds, milliseconds
        return tomorrow;
    } else {
        // If it's not a valid time format, log a warning and return null
        console.warn(`[CSV Import] Invalid time format encountered: "${timeString}". Returning null.`);
        return null;
    }
}

// interface PassengerRow {
//   'Passenger Name': string;
//   'Pick-up Street Number': string;
//   'Pick-up Street': string;
//   'Pick-up City': string;
//   'Pick-up ZIP': string;
//   'Drop-off Street Number': string;
//   'Drop-off Street': string;
//   'Drop-off City': string;
//   'Drop-off ZIP': string;
//   'Earliest Pick-up'?: string;
//   'Latest Pick-up Time'?: string;
//   'Earliest Drop-off Time'?: string;
//   'Latest Drop-off Time'?: string;
//   'Estimated Duration (minutes)'?: string;
// }

// interface GeocodedPassenger extends PassengerRow {
//   pickupLocation?: { lat: number; lng: number };
//   dropoffLocation?: { lat: number; lng: number };
// }

// export const bulkRegisterPassengersFromCSV = async (req: Request, res: Response) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   const filePath = req.file.path;
//   const startTime = Date.now();

//   let processedCount = 0;
//   let successCount = 0;
//   let geocodeFailures = 0;
//   let dbFailures = 0;

//   logInfo(`CSV processing started for file: ${filePath}`);

//   try {
//     const parser = parse({
//       delimiter: ';',
//       columns: true,
//       relax_quotes: true,
//       trim: true,
//       skip_empty_lines: true
//     });

//     const geocoder = new Transform({
//       objectMode: true,
//       async transform(row: PassengerRow, _, callback) {
//         processedCount++;
//         try {
//           const [pickupLocation, dropoffLocation] = await Promise.all([
//             geocodeAddress(row['Pick-up Street Number'], row['Pick-up Street'], row['Pick-up City'], row['Pick-up ZIP']),
//             geocodeAddress(row['Drop-off Street Number'], row['Drop-off Street'], row['Drop-off City'], row['Drop-off ZIP'])
//           ]);

//           if (!pickupLocation || !dropoffLocation) {
//             geocodeFailures++;
//             logWarn(`Row ${processedCount}: Geocode failed for "${row['Passenger Name']}"`);
//             return callback();
//           }

//           callback(null, {
//             ...row,
//             pickupLocation,
//             dropoffLocation
//           });
//         } catch (error) {
//           geocodeFailures++;
//           logError(`Row ${processedCount}: Geocoding error for "${row['Passenger Name']}"`, error);
//           callback();
//         }
//       }
//     });

//     const dbWriter = new Transform({
//       objectMode: true,
//       async transform(passenger: GeocodedPassenger, _, callback) {
//         try {
//           await prisma.passenger.create({
//             data: {
//               name: passenger['Passenger Name'],
//               isDirect: true,
//               estimatedDurationMin: parseOptionalInt(passenger['Estimated Duration (minutes)']),
//               earliestPickupTime: parseTime(passenger['Earliest Pick-up']),
//               latestPickupTime: parseTime(passenger['Latest Pick-up Time']),
//               earliestDropoffTime: parseTime(passenger['Earliest Drop-off Time']),
//               latestDropoffTime: parseTime(passenger['Latest Drop-off Time']),
//               pickupStreetNumber: passenger['Pick-up Street Number'],
//               pickupStreet: passenger['Pick-up Street'],
//               pickupCity: passenger['Pick-up City'],
//               pickupZip: passenger['Pick-up ZIP'],
//               dropoffStreetNumber: passenger['Drop-off Street Number'],
//               dropoffStreet: passenger['Drop-off Street'],
//               dropoffCity: passenger['Drop-off City'],
//               dropoffZip: passenger['Drop-off ZIP'],
//               pickupLat: passenger.pickupLocation?.lat ?? null,
//               pickupLng: passenger.pickupLocation?.lng ?? null,
//               dropoffLat: passenger.dropoffLocation?.lat ?? null,
//               dropoffLng: passenger.dropoffLocation?.lng ?? null,
//             }
//           });

//           successCount++;
//           callback();
//         } catch (error) {
//           dbFailures++;
//           logError(`Row ${processedCount}: DB insert failed for "${passenger['Passenger Name']}"`, error);
//           callback();
//         }
//       }
//     });

//     await new Promise((resolve, reject) => {
//       createReadStream(filePath)
//         .pipe(parser)
//         .on('error', reject)
//         .pipe(geocoder)
//         .on('error', reject)
//         .pipe(dbWriter)
//         .on('error', reject)
//         .on('finish', resolve);
//     });

//     const duration = (Date.now() - startTime) / 1000;
//     console.log(`CSV processing completed in ${duration}s`);

//     return res.json({
//       message: 'Processing completed',
//       processedCount,
//       successCount,
//       geocodeFailures,
//       dbFailures,
//       duration
//     });

//   } catch (error) {
//     console.error('Pipeline failure', error);
//     return res.status(500).json({
//       message: 'Processing failed',
//       error: error instanceof Error ? error.message : String(error)
//     });
//   } finally {
//     try {
//       if (filePath) unlinkSync(filePath);
//     } catch (cleanupError) {
//       logError('File cleanup failed', cleanupError);
//     }
//   }
// };

// parseTime function is imported from helpers

export const getAllPassengers = async (req: Request, res: Response) => {
  try {
    const passengers = await prisma.passenger.findMany();
    if (!passengers || passengers.length === 0) {
      return res.status(404).json({ message: 'No passengers found' });
    }
    return res.status(200).json(passengers);
  } catch (error) {
    console.error('Error fetching passengers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getPassengerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Passenger ID is required' });
  }

  try {
    const passenger = await prisma.passenger.findUnique({
      where: { id },
    });

    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    return res.status(200).json(passenger);
  } catch (error) {
    console.error('Error fetching passenger:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
