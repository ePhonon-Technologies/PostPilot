/*
  Warnings:

  - You are about to drop the column `postId` on the `FailedQueue` table. All the data in the column will be lost.
  - You are about to drop the `PostQueue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobType` to the `FailedQueue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `FailedQueue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `FailedQueue` DROP FOREIGN KEY `FailedQueue_postId_fkey`;

-- DropForeignKey
ALTER TABLE `PostQueue` DROP FOREIGN KEY `PostQueue_postId_fkey`;

-- DropIndex
DROP INDEX `FailedQueue_postId_key` ON `FailedQueue`;

-- AlterTable
ALTER TABLE `FailedQueue` DROP COLUMN `postId`,
    ADD COLUMN `jobType` ENUM('PUBLISH_POST', 'SEND_EMAIL') NOT NULL,
    ADD COLUMN `payload` JSON NOT NULL;

-- DropTable
DROP TABLE `PostQueue`;

-- CreateTable
CREATE TABLE `Queue` (
    `id` VARCHAR(191) NOT NULL,
    `jobType` ENUM('PUBLISH_POST', 'SEND_EMAIL') NOT NULL,
    `payload` JSON NOT NULL,
    `publishAt` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Queue_status_publishAt_idx`(`status`, `publishAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `FailedQueue_jobType_idx` ON `FailedQueue`(`jobType`);
