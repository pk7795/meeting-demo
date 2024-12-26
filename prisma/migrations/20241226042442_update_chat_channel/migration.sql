-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_channelId_key" ON "ChatChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_roomId_key" ON "ChatChannel"("roomId");

-- CreateIndex
CREATE INDEX "ChatChannel_roomId_idx" ON "ChatChannel"("roomId");
