import { prisma } from '@utils/prisma';
import { Passenger, PassengerStatus, Prisma } from '@prisma/client';
import { haversineDistance } from '@utils/helpers'; // We'll create this helper

export class PassengerService {
  // Your bulkRegisterPassengersFromCSV can be moved/adapted here or called from a controller
  // For this example, I'll focus on fetching unassigned passengers.

  async getUnassignedPassengers(
    centerPoint?: { lat: number; lng: number },
    radiusKm?: number // Optional radius for pre-filtering
  ): Promise<Passenger[]> {
    const whereCondition: Prisma.PassengerWhereInput = {
      status: PassengerStatus.UNASSIGNED,
      // Potentially add filters for time windows if needed at this stage
      // e.g., latestPickupTime: { gte: new Date() } // Only those whose latest pickup time hasn't passed
    };

    const passengers = await prisma.passenger.findMany({
      where: whereCondition,
      orderBy: {
        // Prioritize by earliestPickupTime or creation time to handle FIFO / urgency
        earliestPickupTime: 'asc', // Passengers who need pickup sooner
        // createdAt: 'asc', // Or older requests
      },
    });

    if (centerPoint && radiusKm) {
      return passengers.filter((p) => {
        const distance = haversineDistance(centerPoint, {
          lat: p.pickupLat,
          lng: p.pickupLng,
        });
        return distance <= radiusKm;
      });
    }
    return passengers;
  }

  async updatePassengerStatus(
    id: string,
    status: PassengerStatus,
    assignedDriverId?: string
  ): Promise<Passenger | null> {
    try {
      return await prisma.passenger.update({
        where: { id },
        data: {
          status,
          assignedDriverId:
            status === PassengerStatus.ASSIGNED
              ? assignedDriverId
              : status === PassengerStatus.UNASSIGNED
                ? null
                : undefined,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error updating passenger ${id} status:`, error);
      return null;
    }
  }

  async getPassengerById(id: string): Promise<Passenger | null> {
    return prisma.passenger.findUnique({ where: { id } });
  }
}

export const passengerService = new PassengerService();
