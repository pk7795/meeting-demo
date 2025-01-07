-- DropIndex
DROP INDEX "ChatChannel_channelType_key";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RoomParticipant" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
