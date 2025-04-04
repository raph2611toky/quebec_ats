/*
  Warnings:

  - You are about to drop the column `horaire_fermeture` on the `Offre` table. All the data in the column will be lost.
  - You are about to drop the column `horaire_ouverture` on the `Offre` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Offre" DROP COLUMN "horaire_fermeture",
DROP COLUMN "horaire_ouverture";
