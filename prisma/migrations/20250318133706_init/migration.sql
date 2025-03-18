/*
  Warnings:

  - You are about to drop the `referance` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `candidat` MODIFY `telephone` VARCHAR(191) NULL,
    MODIFY `image` VARCHAR(191) NOT NULL DEFAULT 'uploads/candidats/default.png';

-- AlterTable
ALTER TABLE `postulation` ADD COLUMN `telephone` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `referance`;

-- CreateTable
CREATE TABLE `Referent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `recommendation` VARCHAR(191) NULL,
    `statut` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Referent_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CandidatReferent` (
    `candidat_id` INTEGER NOT NULL,
    `referent_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`candidat_id`, `referent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CandidatReferent` ADD CONSTRAINT `CandidatReferent_candidat_id_fkey` FOREIGN KEY (`candidat_id`) REFERENCES `Candidat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidatReferent` ADD CONSTRAINT `CandidatReferent_referent_id_fkey` FOREIGN KEY (`referent_id`) REFERENCES `Referent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
