/*
  Warnings:

  - You are about to drop the column `scheduledFor` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Post_status_scheduledFor_idx` ON `Post`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `scheduledFor`,
    ADD COLUMN `scheduledAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Post_status_scheduledAt_idx` ON `Post`(`status`, `scheduledAt`);
