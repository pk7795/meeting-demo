/*
  Warnings:

  - You are about to drop the column `userId` on the `Messages` table. All the data in the column will be lost.
  - Added the required column `participantId` to the `Messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Messages_userId_idx";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "userId",
ADD COLUMN     "participantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Messages_participantId_idx" ON "Messages"("participantId");
