/*
  Warnings:

  - The `type_emploi` column on the `Offre` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TypeEmploi" AS ENUM ('CDD', 'CDI', 'STAGE');

-- AlterTable
ALTER TABLE "Offre" DROP COLUMN "type_emploi",
ADD COLUMN     "type_emploi" "TypeEmploi" NOT NULL DEFAULT 'CDD';
