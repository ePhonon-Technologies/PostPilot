-- CreateTable
CREATE TABLE `SocialProviderConnection` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `platform` ENUM('LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM') NOT NULL,
    `externalUserId` VARCHAR(191) NOT NULL,
    `userAccessToken` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SocialProviderConnection_profileId_platform_externalUserId_key`(`profileId`, `platform`, `externalUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SocialProviderConnection` ADD CONSTRAINT `SocialProviderConnection_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
