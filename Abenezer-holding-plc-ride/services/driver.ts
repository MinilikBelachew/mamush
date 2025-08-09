import { prisma } from '@utils/prisma';
import { Driver, DriverStatus, Prisma } from '@prisma/client';
// Removed unused import: haversineDistance

export class DriverService {
  async getActiveDrivers(
    statuses: DriverStatus[] = [
      DriverStatus.IDLE,
      DriverStatus.WAITING_POST_DROPOFF,
    ]
  ): Promise<Driver[]> {
    // const now = new Date(); // Unused variable
    return prisma.driver.findMany({
      where: {
        status: { in: statuses },
        // availabilityStart: { lte: now }, // Driver's shift has started
        // availabilityEnd: { gte: now },   // Driver's shift has not ended
      },
    });
  }

  async updateDriverStatus(
    id: string,
    status: DriverStatus,
    currentLocation?: { lat: number; lng: number }
  ): Promise<Driver | null> {
    try {
      const data: Prisma.DriverUpdateInput = { status, updatedAt: new Date() };
      if (currentLocation) {
        data.currentLat = currentLocation.lat;
        data.currentLng = currentLocation.lng;
      }

      if (status === DriverStatus.WAITING_POST_DROPOFF && currentLocation) {
        data.lastDropoffTimestamp = new Date();
        data.lastDropoffLat = currentLocation.lat;
        data.lastDropoffLng = currentLocation.lng;
      } else if (status === DriverStatus.IDLE) {
        const driver = await prisma.driver.findUnique({ where: { id } });
        if (driver?.status === DriverStatus.WAITING_POST_DROPOFF) {
          data.lastDropoffTimestamp = null;
          data.lastDropoffLat = null;
          data.lastDropoffLng = null;
        }
      }

      return await prisma.driver.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error(`Error updating driver ${id} status:`, error);
      return null;
    }
  }

  async updateDriverLocation(
    id: string,
    lat: number,
    lng: number
  ): Promise<Driver | null> {
    try {
      return await prisma.driver.update({
        where: { id },
        data: {
          currentLat: lat,
          currentLng: lng,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error updating driver ${id} location:`, error);
      return null;
    }
  }

  async getDriverById(id: string): Promise<Driver | null> {
    return prisma.driver.findUnique({ where: { id } });
  }
}

export const driverService = new DriverService();
