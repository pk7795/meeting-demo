/*
  Warnings:

  - You are about to drop the column `access_token` on the `ChatToken` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `ChatToken` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `ChatToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatToken" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "refresh_token",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "expiresAt" INTEGER,
ADD COLUMN     "refreshToken" TEXT;
