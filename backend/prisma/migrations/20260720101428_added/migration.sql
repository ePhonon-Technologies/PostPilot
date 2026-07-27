/*
  Warnings:

  - You are about to alter the column `platform` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - A unique constraint covering the columns `[profileId,platform,externalId]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `PostTarget` ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `SocialAccount` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `externalId` VARCHAR(191) NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `refreshToken` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `platform` ENUM('LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM') NOT NULL;

-- CreateIndex
CREATE INDEX `Post_status_scheduledFor_idx` ON `Post`(`status`, `scheduledFor`);

-- CreateIndex
CREATE INDEX `PostTarget_status_idx` ON `PostTarget`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `SocialAccount_profileId_platform_externalId_key` ON `SocialAccount`(`profileId`, `platform`, `externalId`);
