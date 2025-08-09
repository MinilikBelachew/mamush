/*
  Warnings:

  - A unique constraint covering the columns `[currentAssignmentId]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "currentAssignmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_currentAssignmentId_key" ON "Driver"("currentAssignmentId");
