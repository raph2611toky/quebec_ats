/*
  Warnings:

  - You are about to alter the column `statut` on the `referent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(5))`.

*/
-- AlterTable
ALTER TABLE `referent` MODIFY `statut` ENUM('APPROUVE', 'NON_APPROUVE') NOT NULL DEFAULT 'NON_APPROUVE';
