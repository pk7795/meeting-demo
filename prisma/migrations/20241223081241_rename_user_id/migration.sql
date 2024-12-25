/*
  Warnings:

  - You are about to drop the column `chatUserId` on the `ChatToken` table. All the data in the column will be lost.
  - Added the required column `gUserId` to the `ChatToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ChatToken_userId_idx";

-- AlterTable
ALTER TABLE "ChatToken" DROP COLUMN "chatUserId",
ADD COLUMN     "gUserId" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ChatToken_gUserId_idx" ON "ChatToken"("gUserId");
