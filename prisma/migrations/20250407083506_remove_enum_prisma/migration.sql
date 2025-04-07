/*
  Warnings:

  - The `devise` column on the `Offre` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type_emploi` column on the `Offre` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type_temps` column on the `Offre` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SupportRequestStatus" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE');

-- AlterTable
ALTER TABLE "Offre" DROP COLUMN "devise",
ADD COLUMN     "devise" TEXT NOT NULL DEFAULT 'Euro',
DROP COLUMN "type_emploi",
ADD COLUMN     "type_emploi" TEXT NOT NULL DEFAULT 'CDD',
DROP COLUMN "type_temps",
ADD COLUMN     "type_temps" TEXT NOT NULL DEFAULT 'PLEIN_TEMPS';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" SET DEFAULT '';

-- DropEnum
DROP TYPE "Devise";

-- DropEnum
DROP TYPE "TypeEmploi";

-- DropEnum
DROP TYPE "TypeTemps";

-- CreateTable
CREATE TABLE "SupportSiteRequest" (
    "id" SERIAL NOT NULL,
    "sujet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "emailSource" TEXT NOT NULL,
    "statut" "SupportRequestStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportSiteRequest_pkey" PRIMARY KEY ("id")
);
