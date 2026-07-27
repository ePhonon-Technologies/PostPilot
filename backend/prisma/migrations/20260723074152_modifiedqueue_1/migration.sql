/*
  Warnings:

  - A unique constraint covering the columns `[entityKey]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `FailedQueue` ADD COLUMN `entityKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Queue` ADD COLUMN `entityKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Queue_entityKey_key` ON `Queue`(`entityKey`);
