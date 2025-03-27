/*
  Warnings:

  - A unique constraint covering the columns `[candidat_id,offre_id]` on the table `Postulation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Postulation_candidat_id_offre_id_key" ON "Postulation"("candidat_id", "offre_id");
