/*
  Warnings:

  - A unique constraint covering the columns `[nextAssignmentId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "nextAssignmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_nextAssignmentId_key" ON "Assignment"("nextAssignmentId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_nextAssignmentId_fkey" FOREIGN KEY ("nextAssignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
