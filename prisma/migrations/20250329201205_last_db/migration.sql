/*
  Warnings:

  - The values [ANNULER] on the enum `TypeProcessus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `organisation_id` to the `Offre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Remarque` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "StatutProcessus" ADD VALUE 'ANNULER';

-- AlterEnum
BEGIN;
CREATE TYPE "TypeProcessus_new" AS ENUM ('TACHE', 'VISIO_CONFERENCE', 'QUESTIONNAIRE');
ALTER TABLE "Processus" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Processus" ALTER COLUMN "type" TYPE "TypeProcessus_new" USING ("type"::text::"TypeProcessus_new");
ALTER TYPE "TypeProcessus" RENAME TO "TypeProcessus_old";
ALTER TYPE "TypeProcessus_new" RENAME TO "TypeProcessus";
DROP TYPE "TypeProcessus_old";
ALTER TABLE "Processus" ALTER COLUMN "type" SET DEFAULT 'VISIO_CONFERENCE';
COMMIT;

-- DropForeignKey
ALTER TABLE "CandidatReferent" DROP CONSTRAINT "CandidatReferent_candidat_id_fkey";

-- DropForeignKey
ALTER TABLE "CandidatReferent" DROP CONSTRAINT "CandidatReferent_referent_id_fkey";

-- DropForeignKey
ALTER TABLE "Offre" DROP CONSTRAINT "Offre_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Postulation" DROP CONSTRAINT "Postulation_candidat_id_fkey";

-- DropForeignKey
ALTER TABLE "Postulation" DROP CONSTRAINT "Postulation_offre_id_fkey";

-- DropForeignKey
ALTER TABLE "Processus" DROP CONSTRAINT "Processus_offre_id_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_processus_id_fkey";

-- DropForeignKey
ALTER TABLE "Remarque" DROP CONSTRAINT "Remarque_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "Remarque" DROP CONSTRAINT "Remarque_postulation_id_fkey";

-- DropForeignKey
ALTER TABLE "Reponse" DROP CONSTRAINT "Reponse_question_id_fkey";

-- AlterTable
ALTER TABLE "Offre" ADD COLUMN     "organisation_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Remarque" ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL DEFAULT '',
    "ville" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCarriere" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "images" TEXT[],
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCarriere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserOrganisations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserOrganisations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_nom_adresse_ville_key" ON "Organisation"("nom", "adresse", "ville");

-- CreateIndex
CREATE INDEX "_UserOrganisations_B_index" ON "_UserOrganisations"("B");

-- AddForeignKey
ALTER TABLE "PostCarriere" ADD CONSTRAINT "PostCarriere_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulation" ADD CONSTRAINT "Postulation_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "Candidat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulation" ADD CONSTRAINT "Postulation_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "Offre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatReferent" ADD CONSTRAINT "CandidatReferent_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "Candidat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatReferent" ADD CONSTRAINT "CandidatReferent_referent_id_fkey" FOREIGN KEY ("referent_id") REFERENCES "Referent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "Offre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_processus_id_fkey" FOREIGN KEY ("processus_id") REFERENCES "Processus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse" ADD CONSTRAINT "Reponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_postulation_id_fkey" FOREIGN KEY ("postulation_id") REFERENCES "Postulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserOrganisations" ADD CONSTRAINT "_UserOrganisations_A_fkey" FOREIGN KEY ("A") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserOrganisations" ADD CONSTRAINT "_UserOrganisations_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
