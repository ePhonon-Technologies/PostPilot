-- AlterTable
ALTER TABLE `Post` ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- RenameIndex
ALTER TABLE `Post` RENAME INDEX `Post_profileId_fkey` TO `Post_profileId_idx`;
