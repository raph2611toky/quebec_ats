/*
  Warnings:

  - You are about to drop the column `duree` on the `Processus` table. All the data in the column will be lost.
  - You are about to drop the column `ordre` on the `Processus` table. All the data in the column will be lost.
  - You are about to drop the column `start_at` on the `Processus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Processus" DROP COLUMN "duree",
DROP COLUMN "ordre",
DROP COLUMN "start_at";
