/*
  Warnings:

  - Added the required column `offre_id` to the `Processus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Processus" ADD COLUMN     "offre_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
