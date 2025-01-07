-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE');

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';
