/*
  Warnings:

  - You are about to drop the column `ordee` on the `Processus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Processus" DROP COLUMN "ordee",
ADD COLUMN     "ordre" INTEGER NOT NULL DEFAULT 0;
