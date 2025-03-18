/*
  Warnings:

  - You are about to drop the column `horaire` on the `offre` table. All the data in the column will be lost.
  - Added the required column `horaire_fermeture` to the `Offre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaire_ouverture` to the `Offre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `offre` DROP COLUMN `horaire`,
    ADD COLUMN `horaire_fermeture` VARCHAR(191) NOT NULL,
    ADD COLUMN `horaire_ouverture` VARCHAR(191) NOT NULL;
