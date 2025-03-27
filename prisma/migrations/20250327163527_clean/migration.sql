-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MODERATEUR', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREE', 'OUVERT', 'FERME');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('EURO', 'DOLLAR', 'DOLLAR_CANADIAN', 'LIVRE', 'YEN', 'ROUPIE', 'ARIARY');

-- CreateEnum
CREATE TYPE "EtapeActuelle" AS ENUM ('SOUMIS', 'EN_REVISION', 'ACCEPTE', 'REJETE');

-- CreateEnum
CREATE TYPE "SourceSite" AS ENUM ('LINKEDIN', 'INDEED', 'JOOBLE', 'FRANCETRAVAIL', 'MESSAGER', 'WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'TWITTER', 'QUEBEC_SITE');

-- CreateEnum
CREATE TYPE "StatutReferent" AS ENUM ('APPROUVE', 'NON_APPROUVE');

-- CreateEnum
CREATE TYPE "TypeProcessus" AS ENUM ('TACHE', 'VISIO_CONFERENCE', 'QUESTIONNAIRE', 'ANNULER');

-- CreateEnum
CREATE TYPE "StatutProcessus" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile" TEXT NOT NULL DEFAULT 'profile.png',
    "role" "Role" NOT NULL DEFAULT 'MODERATEUR',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL DEFAULT '',
    "user_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_limite" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL,
    "nombre_requis" INTEGER NOT NULL DEFAULT 1,
    "lieu" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "type_emploi" TEXT NOT NULL,
    "salaire" DECIMAL(65,30) NOT NULL,
    "devise" "Devise" NOT NULL,
    "horaire_ouverture" TEXT NOT NULL,
    "horaire_fermeture" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidat" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "is_email_active" BOOLEAN NOT NULL DEFAULT false,
    "telephone" TEXT,
    "image" TEXT NOT NULL DEFAULT 'uploads/candidats/default.png',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulation" (
    "id" SERIAL NOT NULL,
    "candidat_id" INTEGER NOT NULL,
    "offre_id" INTEGER NOT NULL,
    "date_soumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etape_actuelle" "EtapeActuelle" NOT NULL DEFAULT 'SOUMIS',
    "cv" TEXT NOT NULL,
    "lettre_motivation" TEXT,
    "source_site" "SourceSite" NOT NULL DEFAULT 'LINKEDIN',
    "note" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Postulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referent" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "recommendation" TEXT,
    "statut" "StatutReferent" NOT NULL DEFAULT 'NON_APPROUVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidatReferent" (
    "candidat_id" INTEGER NOT NULL,
    "referent_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidatReferent_pkey" PRIMARY KEY ("candidat_id","referent_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "est_lu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "otp" VARCHAR(8) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Processus" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "type" "TypeProcessus" NOT NULL DEFAULT 'VISIO_CONFERENCE',
    "description" TEXT NOT NULL,
    "statut" "StatutProcessus" NOT NULL DEFAULT 'A_VENIR',
    "offre_id" INTEGER NOT NULL,
    "duree" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Processus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "processus_id" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reponse" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "is_true" BOOLEAN NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "Reponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remarque" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "postulation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remarque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_email_key" ON "Candidat"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Postulation_candidat_id_offre_id_key" ON "Postulation"("candidat_id", "offre_id");

-- CreateIndex
CREATE UNIQUE INDEX "Referent_email_key" ON "Referent"("email");

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulation" ADD CONSTRAINT "Postulation_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "Candidat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulation" ADD CONSTRAINT "Postulation_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatReferent" ADD CONSTRAINT "CandidatReferent_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "Candidat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatReferent" ADD CONSTRAINT "CandidatReferent_referent_id_fkey" FOREIGN KEY ("referent_id") REFERENCES "Referent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_processus_id_fkey" FOREIGN KEY ("processus_id") REFERENCES "Processus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse" ADD CONSTRAINT "Reponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_postulation_id_fkey" FOREIGN KEY ("postulation_id") REFERENCES "Postulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
