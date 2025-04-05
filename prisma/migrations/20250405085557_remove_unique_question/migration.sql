/*
  Warnings:

  - You are about to drop the column `ordre` on the `Question` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Question_ordre_processus_id_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "ordre";
