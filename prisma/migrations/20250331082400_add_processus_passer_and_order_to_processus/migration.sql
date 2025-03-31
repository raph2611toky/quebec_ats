/*
  Warnings:

  - A unique constraint covering the columns `[ordre,processus_id]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatutProcessusPasser" AS ENUM ('EN_COURS', 'TERMINER');

-- AlterTable
ALTER TABLE "Processus" ADD COLUMN     "ordee" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "ordre" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "QueueInvitationOrganisation" (
    "id" SERIAL NOT NULL,
    "inviter_id" INTEGER NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "organisation_id" INTEGER,
    "role" "Role" NOT NULL DEFAULT 'MODERATEUR',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueInvitationOrganisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessusPasser" (
    "id" SERIAL NOT NULL,
    "processus_id" INTEGER NOT NULL,
    "postulation_id" INTEGER NOT NULL,
    "statut" "StatutProcessus" NOT NULL DEFAULT 'EN_COURS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lien_web" TEXT,
    "lien_fichier" TEXT,
    "lien_vision" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessusPasser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueInvitationOrganisation_token_key" ON "QueueInvitationOrganisation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Question_ordre_processus_id_key" ON "Question"("ordre", "processus_id");

-- AddForeignKey
ALTER TABLE "QueueInvitationOrganisation" ADD CONSTRAINT "QueueInvitationOrganisation_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueInvitationOrganisation" ADD CONSTRAINT "QueueInvitationOrganisation_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessusPasser" ADD CONSTRAINT "ProcessusPasser_processus_id_fkey" FOREIGN KEY ("processus_id") REFERENCES "Processus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessusPasser" ADD CONSTRAINT "ProcessusPasser_postulation_id_fkey" FOREIGN KEY ("postulation_id") REFERENCES "Postulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
