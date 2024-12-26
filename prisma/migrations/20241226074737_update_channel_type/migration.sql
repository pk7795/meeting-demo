/*
  Warnings:

  - A unique constraint covering the columns `[channelType]` on the table `ChatChannel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channelType` to the `ChatChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatChannel" ADD COLUMN     "channelType" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_channelType_key" ON "ChatChannel"("channelType");
