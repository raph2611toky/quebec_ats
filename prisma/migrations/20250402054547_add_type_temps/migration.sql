/*
  Warnings:

  - The `statut` column on the `ProcessusPasser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `image_url` on table `Offre` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TypeTemps" AS ENUM ('PLEIN_TEMPS', 'TEMPS_PARTIEL');

-- AlterTable
ALTER TABLE "Offre" ADD COLUMN     "type_temps" "TypeTemps" NOT NULL DEFAULT 'PLEIN_TEMPS',
ALTER COLUMN "image_url" SET NOT NULL,
ALTER COLUMN "image_url" SET DEFAULT '';

-- AlterTable
ALTER TABLE "ProcessusPasser" DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutProcessusPasser" NOT NULL DEFAULT 'EN_COURS';
