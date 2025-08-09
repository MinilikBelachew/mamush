import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const prisma = new PrismaClient();

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  speedKmh?: number; // Optional speed property
}

// driverLocations now uses strings for keys
const driverLocations: Record<string, DriverLocation> = {};

export function configureSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    // Accept both legacy 'driverLocation' and new 'location-update' events
    const handleDriverLocation = async (data: any) => {
      try {
        const token: string | undefined = data.token;
        const userId: string | undefined = data.userId ?? data.driverId;
        if (!token || !userId) throw new Error("Missing token or userId");

        const decoded = jwt.verify(token, JWT_SECRET) as { driverId: string };
        if (decoded.driverId !== userId) throw new Error("Driver ID mismatch");

        const driver = await prisma.driver.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true },
        });
        if (!driver) throw new Error("Driver not found for ID: " + userId);

        driverLocations[userId] = {
          lat: data.lat,
          lng: data.lng,
          timestamp: Date.now(),
          speedKmh: data.speedKmh,
        };

        io.emit("updateLocation", {
          driverId: userId,
          lat: data.lat,
          lng: data.lng,
          firstName: driver.firstName,
          lastName: driver.lastName,
          speedKmh: data.speedKmh,
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        console.log("Location update error:", err.message);
      }
    };

    socket.on("driverLocation", handleDriverLocation);
    socket.on("location-update", handleDriverLocation);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

export { driverLocations };







// // import { Server, Socket } from "socket.io";
// // import jwt from "jsonwebtoken";
// // import { PrismaClient } from "@prisma/client";

// // const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// // const prisma = new PrismaClient();

// // interface DriverLocation {
// //   lat: number;
// //   lng: number;
// //   timestamp: number;
// //   speedKmh?: number;
// // }

// // const driverLocations: Record<number, DriverLocation> = {};

// // export function configureSocket(io: Server) {
// //   io.on("connection", (socket: Socket) => {
// //     console.log("🟢 Socket connected:", socket.id);

// //     // ✅ Immediately send all cached locations
// //     Object.entries(driverLocations).forEach(async ([driverId, location]) => {
// //       try {
// //         const driver = await prisma.driver.findUnique({
// //           where: { id: driverId },
// //           select: { firstName: true, lastName: true },
// //         });

// //         if (driver) {
// //           socket.emit("updateLocation", {
// //             driverId: Number(driverId),
// //             lat: location.lat,
// //             lng: location.lng,
// //             timestamp: location.timestamp,
// //             speedKmh: location.speedKmh,
// //             firstName: driver.firstName,
// //             lastName: driver.lastName,
// //           });
// //         }
// //       } catch (err) {
// //         console.error("Failed to send initial location:", err);
// //       }
// //     });

// //     socket.on("requestAllLocations", () => {
// //       Object.entries(driverLocations).forEach(async ([driverId, location]) => {
// //         try {
// //           const driver = await prisma.driver.findUnique({
// //             where: { id: driverId },
// //             select: { firstName: true, lastName: true },
// //           });

// //           if (driver) {
// //             socket.emit("updateLocation", {
// //               driverId: Number(driverId),
// //               lat: location.lat,
// //               lng: location.lng,
// //               timestamp: location.timestamp,
// //               speedKmh: location.speedKmh,
// //               firstName: driver.firstName,
// //               lastName: driver.lastName,
// //             });
// //           }
// //         } catch (err) {
// //           console.error("Failed to send requested location:", err);
// //         }
// //       });
// //     });


// //     socket.on("driverLocation", async (data) => {
// //       try {
// //         const decoded = jwt.verify(data.token, JWT_SECRET) as { driverId: number };

// //         if (decoded.driverId !== data.driverId) {
// //           throw new Error("Driver ID mismatch");
// //         }

// //         const driver = await prisma.driver.findUnique({
// //           where: { id: data.driverId },
// //           select: { firstName: true, lastName: true },
// //         });

// //         if (!driver) {
// //           throw new Error("Driver not found");
// //         }

// //         // ✅ Save in cache
// //         driverLocations[data.driverId] = {
// //           lat: data.lat,
// //           lng: data.lng,
// //           timestamp: Date.now(),
// //           speedKmh: data.speedKmh,
// //         };

// //         io.emit("updateLocation", {
// //           driverId: data.driverId,
// //           lat: data.lat,
// //           lng: data.lng,
// //           firstName: driver.firstName,
// //           lastName: driver.lastName,
// //           speedKmh: data.speedKmh,
// //         });

// //         console.log(
// //           `📍 Driver ${driver.firstName} ${driver.lastName} updated: [${data.lat}, ${data.lng}] Speed: ${data.speedKmh} km/h`
// //         );
// //       } catch (err: any) {
// //         console.error("Location update error:", err.message);
// //       }
// //     });

// //     socket.on("disconnect", () => {
// //       console.log("🔴 Socket disconnected:", socket.id);
// //     });
// //   });
// // }

// // export { driverLocations };

// import { Server, Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import { prisma } from '@utils/prisma'; // Use shared prisma instance
// import { DriverStatus } from '@prisma/client';

// const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// interface DriverLocation {
//   lat: number;
//   lng: number;
//   timestamp: number;
//   speedKmh?: number;
// }

// const driverLocations: Record<number, DriverLocation> = {};
// const activeConnections = new Map<string, Socket>();

// export function configureSocket(io: Server) {
//   console.log('Configuring socket.io handlers');

//   io.on('connection', (socket: Socket) => {
//     console.log('🟢 Socket connected:', socket.id);

//     // Handle authentication
//     socket.on('authenticate', (data: { userId: string; type: 'driver' | 'passenger' }) => {
//       activeConnections.set(data.userId, socket);
//       console.log(`Authenticated ${data.type}: ${data.userId}`);
//       socket.join(data.userId);
//       socket.join(data.type === 'driver' ? 'drivers-room' : 'passengers-room');
//     });

//     // Send all cached locations to new client
//     Object.entries(driverLocations).forEach(async ([driverId, location]) => {
//       try {
//         const driver = await prisma.driver.findUnique({
//           where: { id: Number(driverId) },
//           select: { firstName: true, lastName: true },
//         });

//         if (driver) {
//           socket.emit('updateLocation', {
//             driverId: Number(driverId),
//             lat: location.lat,
//             lng: location.lng,
//             timestamp: location.timestamp,
//             speedKmh: location.speedKmh,
//             firstName: driver.firstName,
//             lastName: driver.lastName,
//           });
//         }
//       } catch (err) {
//         console.error('Failed to send initial location:', err);
//       }
//     });

//     socket.on('requestAllLocations', () => {
//       Object.entries(driverLocations).forEach(async ([driverId, location]) => {
//         try {
//           const driver = await prisma.driver.findUnique({
//             where: { id: Number(driverId) },
//             select: { firstName: true, lastName: true },
//           });

//           if (driver) {
//             socket.emit('updateLocation', {
//               driverId: Number(driverId),
//               lat: location.lat,
//               lng: location.lng,
//               timestamp: location.timestamp,
//               speedKmh: location.speedKmh,
//               firstName: driver.firstName,
//               lastName: driver.lastName,
//             });
//           }
//         } catch (err) {
//           console.error('Failed to send requested location:', err);
//         }
//       });
//     });

//     socket.on(
//       'location-update',
//       async (data: {
//         userId: string;
//         type: 'driver' | 'passenger';
//         lat: number;
//         lng: number;
//         status?: DriverStatus;
//         token?: string;
//       }) => {
//         try {
//           const timestamp = new Date().toISOString();

//           if (data.type === 'driver') {
//             if (!data.token) throw new Error('Token required for driver');
//             const decoded = jwt.verify(data.token, JWT_SECRET) as { driverId: number };
//             if (decoded.driverId !== Number(data.userId)) {
//               throw new Error('Driver ID mismatch');
//             }

//             const driver = await prisma.driver.findUnique({
//               where: { id: Number(data.userId) },
//               select: { firstName: true, lastName: true },
//             });

//             if (!driver) throw new Error('Driver not found');

//             driverLocations[data.userId] = {
//               lat: data.lat,
//               lng: data.lng,
//               timestamp: Date.now(),
//               speedKmh: data.speedKmh,
//             };

//             io.emit('updateLocation', {
//               driverId: Number(data.userId),
//               lat: data.lat,
//               lng: data.lng,
//               firstName: driver.firstName,
//               lastName: driver.lastName,
//               speedKmh: data.speedKmh,
//               timestamp,
//             });

//             console.log(
//               `📍 Driver ${driver.firstName} ${driver.lastName} updated: [${data.lat}, ${data.lng}] Speed: ${data.speedKmh} km/h`
//             );

//             if (data.status) {
//               io.to('admin-dashboard').emit('driver-status-update', {
//                 driverId: data.userId,
//                 status: data.status,
//                 timestamp,
//               });
//             }
//           }

//           io.to('admin-dashboard').emit('updateLocation', {
//             userId: data.userId,
//             type: data.type,
//             lat: data.lat,
//             lng: data.lng,
//             timestamp,
//           });
//         } catch (err: any) {
//           console.error('Location update error:', err.message);
//         }
//       }
//     );

//     socket.on('join-tracking', () => {
//       socket.join('admin-dashboard');
//       console.log('Admin dashboard connected to tracking');
//     });

//     socket.on('disconnect', () => {
//       console.log('🔴 Socket disconnected:', socket.id);
//       for (const [userId, sock] of activeConnections) {
//         if (sock.id === socket.id) {
//           activeConnections.delete(userId);
//           break;
//         }
//       }
//     });
//   });
// }

// export { driverLocations };