/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `homeBaseLat` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `homeBaseLng` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `lastKnownLat` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `lastKnownLng` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleType` on the `Driver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[driverId,passengerId,assignedAt]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availabilityEnd` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availabilityStart` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentLat` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentLng` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Made the column `pickupLat` on table `Passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pickupLng` on table `Passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dropoffLat` on table `Passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dropoffLng` on table `Passenger` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PassengerStatus" AS ENUM ('UNASSIGNED', 'ASSIGNED', 'PICKED_UP', 'DROPPED_OFF', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('IDLE', 'EN_ROUTE_TO_PICKUP', 'EN_ROUTE_TO_DROPOFF', 'WAITING_POST_DROPOFF', 'OFFLINE', 'BUSY');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_PASSENGER', 'CANCELLED_BY_DRIVER', 'CANCELLED_BY_SYSTEM', 'FAILED');

-- DropIndex
DROP INDEX "Driver_phone_key";

-- DropIndex
DROP INDEX "Driver_plateNumber_key";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "completedAt",
ADD COLUMN     "actualDropoffTime" TIMESTAMP(3),
ADD COLUMN     "actualPickupTime" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estimatedDropoffTime" TIMESTAMP(3),
ADD COLUMN     "estimatedPickupTime" TIMESTAMP(3),
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "homeBaseLat",
DROP COLUMN "homeBaseLng",
DROP COLUMN "isAvailable",
DROP COLUMN "lastKnownLat",
DROP COLUMN "lastKnownLng",
DROP COLUMN "lastUpdated",
DROP COLUMN "licenseNumber",
DROP COLUMN "phone",
DROP COLUMN "plateNumber",
DROP COLUMN "vehicleType",
ADD COLUMN     "availabilityEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "availabilityStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "currentLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currentLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lastDropoffLat" DOUBLE PRECISION,
ADD COLUMN     "lastDropoffLng" DOUBLE PRECISION,
ADD COLUMN     "lastDropoffTimestamp" TIMESTAMP(3),
ADD COLUMN     "status" "DriverStatus" NOT NULL DEFAULT 'IDLE';

-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "assignedDriverId" TEXT,
ADD COLUMN     "groupSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "PassengerStatus" NOT NULL DEFAULT 'UNASSIGNED',
ALTER COLUMN "isDirect" DROP NOT NULL,
ALTER COLUMN "isDirect" SET DEFAULT false,
ALTER COLUMN "pickupLat" SET NOT NULL,
ALTER COLUMN "pickupLng" SET NOT NULL,
ALTER COLUMN "dropoffLat" SET NOT NULL,
ALTER COLUMN "dropoffLng" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_driverId_passengerId_assignedAt_key" ON "Assignment"("driverId", "passengerId", "assignedAt");

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
