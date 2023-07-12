-- AlterTable
ALTER TABLE `ServerGroup` ADD COLUMN `nodeBillWindowMs` INTEGER NULL,
    ADD COLUMN `nodeCreateTimeoutMs` INTEGER NULL,
    ADD COLUMN `nodeMin` INTEGER NULL,
    ADD COLUMN `provider` ENUM('Aws', 'Bizfly', 'Local') NULL,
    ADD COLUMN `usageLimitDown` INTEGER NULL,
    ADD COLUMN `usageLimitUp` INTEGER NULL;

-- AlterTable
ALTER TABLE `ServerInstanceService` ADD COLUMN `serviceUsing` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `CloudServerReference` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `destroyRequestedAt` DATETIME(3) NULL,
    `destroyedAt` DATETIME(3) NULL,
    `groupId` VARCHAR(191) NOT NULL,

    INDEX `CloudServerReference_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Account_userId_idx` ON `Account`(`userId`);

-- CreateIndex
CREATE INDEX `ServerGroupService_groupId_idx` ON `ServerGroupService`(`groupId`);

-- CreateIndex
CREATE INDEX `ServerInstance_groupId_idx` ON `ServerInstance`(`groupId`);

-- CreateIndex
CREATE INDEX `ServerInstance_localId_idx` ON `ServerInstance`(`localId`);

-- CreateIndex
CREATE INDEX `ServerInstanceService_serviceId_idx` ON `ServerInstanceService`(`serviceId`);

-- CreateIndex
CREATE INDEX `ServerInstanceTask_instanceId_idx` ON `ServerInstanceTask`(`instanceId`);

-- CreateIndex
CREATE INDEX `Session_userId_idx` ON `Session`(`userId`);
