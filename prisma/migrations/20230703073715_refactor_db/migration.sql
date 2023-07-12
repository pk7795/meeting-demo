-- CreateTable
CREATE TABLE `ServerGroup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServerGroup_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerGroupService` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `cmd` VARCHAR(191) NOT NULL,
    `args` JSON NOT NULL,
    `env` JSON NOT NULL,
    `version` INTEGER NOT NULL,
    `enable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceArgTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `args` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceEnvTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `env` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerInstance` (
    `id` VARCHAR(191) NOT NULL,
    `localId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `registerAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `cpuUsage` DOUBLE NULL,
    `memUsage` DOUBLE NULL,
    `diskUsage` DOUBLE NULL,
    `networkIn` INTEGER NULL,
    `networkOut` INTEGER NULL,
    `lastPing` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServerInstance_localId_key`(`localId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerInstanceService` (
    `id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `enable` BOOLEAN NOT NULL DEFAULT true,
    `lastPing` DATETIME(3) NULL,
    `cpuUsage` DOUBLE NULL,
    `memUsage` DOUBLE NULL,
    `serviceUsage` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServerInstanceService_instanceId_serviceId_key`(`instanceId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerInstanceTask` (
    `id` VARCHAR(191) NOT NULL,
    `task` VARCHAR(191) NOT NULL,
    `params` JSON NOT NULL,
    `state` ENUM('Pending', 'Running', 'Success', 'Error') NOT NULL DEFAULT 'Pending',
    `error` VARCHAR(191) NULL,
    `response` JSON NULL,
    `responseAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,

    INDEX `ServerInstanceTask_sentAt_idx`(`sentAt`),
    INDEX `ServerInstanceTask_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ServerGroupServiceToServiceArgTemplate` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ServerGroupServiceToServiceArgTemplate_AB_unique`(`A`, `B`),
    INDEX `_ServerGroupServiceToServiceArgTemplate_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ServerGroupServiceToServiceEnvTemplate` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ServerGroupServiceToServiceEnvTemplate_AB_unique`(`A`, `B`),
    INDEX `_ServerGroupServiceToServiceEnvTemplate_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
