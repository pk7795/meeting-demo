-- CreateTable
CREATE TABLE "ChatToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatToken_userId_idx" ON "ChatToken"("userId");
