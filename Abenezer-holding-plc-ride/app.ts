import express, { Request, Response, NextFunction } from 'express';
import driverRoutes from '@routes/driverRoutes.js';
import passengerRoutes from '@routes/passengersRoute.js';
import assignmentRoutes from '@routes/assignment.js';
import userRoutes from '@routes/user.js';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

import { Server, Socket } from 'socket.io';
import http from 'http';

dotenv.config();

import { fileURLToPath } from 'url';
import { Assignment, DriverStatus } from '@prisma/client';
import { prisma } from '@utils/prisma';
import { configureSocket } from './socket/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/passengers', passengerRoutes);
app.use('/api/v1/assignment', assignmentRoutes);
app.use('/api/v1/auth', userRoutes);

app.get('/debug-drivers', async (req, res) => {
  console.log('--- DEBUG ROUTE HIT ---');
  try {
    const busyDrivers = await prisma.driver.findMany({
      where: {
        status: { in: ['EN_ROUTE_TO_PICKUP', 'EN_ROUTE_TO_DROPOFF'] },
      },
    });
    console.log(`Found ${busyDrivers.length} busy drivers via debug route.`);
    res.json(busyDrivers);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});



const server = http.createServer(app);

// Use ES6 import for Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  allowEIO3: true,
});

configureSocket(io);

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// const activeConnections = new Map<string, Socket>();

// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   // Handle authentication
//   socket.on(
//     'authenticate',
//     (data: { userId: string; type: 'driver' | 'passenger' }) => {
//       activeConnections.set(data.userId, socket);
//       console.log(`Authenticated ${data.type}: ${data.userId}`);

//       // Join appropriate rooms
//       socket.join(data.userId);
//       socket.join(data.type === 'driver' ? 'drivers-room' : 'passengers-room');
//     }
//   );

//   // Handle location updates
//   socket.on(
//     'location-update',
//     (data: {
//       userId: string;
//       type: 'driver' | 'passenger';
//       lat: number;
//       lng: number;
//       status?: DriverStatus;
//     }) => {
//       const timestamp = new Date().toISOString();

//       // Broadcast to admin dashboard
//       io.to('admin-dashboard').emit(`${data.type}-location-update`, {
//         ...data,
//         timestamp,
//       });

//       // For drivers, also update status if provided
//       if (data.type === 'driver' && data.status) {
//         io.to('admin-dashboard').emit('driver-status-update', {
//           driverId: data.userId,
//           status: data.status,
//           timestamp,
//         });
//       }
//     }
//   );

//   // Handle admin dashboard connection
//   socket.on('join-tracking', () => {
//     socket.join('admin-dashboard');
//     console.log('Admin dashboard connected to tracking');
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//     // Clean up active connections
//     for (const [userId, sock] of activeConnections) {
//       if (sock.id === socket.id) {
//         activeConnections.delete(userId);
//         break;
//       }
//     }
//   });
// });

// Integrate with your assignment service

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// console.log('Socket.io server initialized');
// configureSocket(io); // Integrate socket.ts logic
// export function emitAssignmentUpdate(assignment: Assignment) {
//   io.to('admin-dashboard').emit('assignment-status-update', assignment);
// }

// export function emitDriverStatus(driverId: string, status: DriverStatus) {
//   io.to('admin-dashboard').emit('driver-status-update', {
//     driverId,
//     status,
//     timestamp: new Date().toISOString(),
//   });
// }

// export { app, server };
