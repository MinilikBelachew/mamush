/*
  Warnings:

  - You are about to drop the column `name` on the `Driver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mdtUsername]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mdtUsername` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AssignmentStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "name",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "driverLicenseExpiration" TIMESTAMP(3),
ADD COLUMN     "driverLicenseNumber" TEXT,
ADD COLUMN     "driverLicenseState" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactNote" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactPhoneExtension" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "employeeNumber" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "hireDate" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "mdtUsername" TEXT NOT NULL,
ADD COLUMN     "middleInitial" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneExtension" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "seniority" TEXT,
ADD COLUMN     "skill" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "vehicle" TEXT,
ADD COLUMN     "zipCode" TEXT,
ALTER COLUMN "availabilityEnd" DROP NOT NULL,
ALTER COLUMN "availabilityStart" DROP NOT NULL,
ALTER COLUMN "capacity" DROP NOT NULL,
ALTER COLUMN "currentLat" DROP NOT NULL,
ALTER COLUMN "currentLng" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_mdtUsername_key" ON "Driver"("mdtUsername");
