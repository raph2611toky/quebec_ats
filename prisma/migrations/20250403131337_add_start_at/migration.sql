/*
  Warnings:

  - Added the required column `start_at` to the `Processus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offre" ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Processus" ADD COLUMN     "start_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP DEFAULT;
