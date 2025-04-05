/*
  Warnings:

  - The values [VISIO_CONFERENCE] on the enum `TypeProcessus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `statut` on the `Processus` table. All the data in the column will be lost.
  - You are about to drop the `ProcessusPasser` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeProcessus_new" AS ENUM ('TACHE', 'QUESTIONNAIRE');
ALTER TABLE "Processus" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Processus" ALTER COLUMN "type" TYPE "TypeProcessus_new" USING ("type"::text::"TypeProcessus_new");
ALTER TYPE "TypeProcessus" RENAME TO "TypeProcessus_old";
ALTER TYPE "TypeProcessus_new" RENAME TO "TypeProcessus";
DROP TYPE "TypeProcessus_old";
ALTER TABLE "Processus" ALTER COLUMN "type" SET DEFAULT 'QUESTIONNAIRE';
COMMIT;

-- DropForeignKey
ALTER TABLE "ProcessusPasser" DROP CONSTRAINT "ProcessusPasser_postulation_id_fkey";

-- DropForeignKey
ALTER TABLE "ProcessusPasser" DROP CONSTRAINT "ProcessusPasser_processus_id_fkey";

-- AlterTable
ALTER TABLE "Processus" DROP COLUMN "statut",
ALTER COLUMN "type" SET DEFAULT 'QUESTIONNAIRE';

-- DropTable
DROP TABLE "ProcessusPasser";

-- DropEnum
DROP TYPE "StatutProcessus";

-- DropEnum
DROP TYPE "StatutProcessusPasser";

-- CreateTable
CREATE TABLE "ReponsePreSelection" (
    "id" SERIAL NOT NULL,
    "postulation_id" INTEGER NOT NULL,
    "processus_id" INTEGER NOT NULL,
    "question_id" INTEGER,
    "reponse_id" INTEGER,
    "url" TEXT,

    CONSTRAINT "ReponsePreSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReponsePreSelection_postulation_id_processus_id_question_id_key" ON "ReponsePreSelection"("postulation_id", "processus_id", "question_id");

-- AddForeignKey
ALTER TABLE "ReponsePreSelection" ADD CONSTRAINT "ReponsePreSelection_postulation_id_fkey" FOREIGN KEY ("postulation_id") REFERENCES "Postulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponsePreSelection" ADD CONSTRAINT "ReponsePreSelection_processus_id_fkey" FOREIGN KEY ("processus_id") REFERENCES "Processus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponsePreSelection" ADD CONSTRAINT "ReponsePreSelection_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponsePreSelection" ADD CONSTRAINT "ReponsePreSelection_reponse_id_fkey" FOREIGN KEY ("reponse_id") REFERENCES "Reponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
