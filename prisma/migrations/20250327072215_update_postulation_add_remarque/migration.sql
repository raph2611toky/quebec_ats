/*
  Warnings:

  - The values [ENTRETIEN] on the enum `EtapeActuelle` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `password` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `telephone` on the `Postulation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EtapeActuelle_new" AS ENUM ('SOUMIS', 'EN_REVISION', 'ACCEPTE', 'REJETE');
ALTER TABLE "Postulation" ALTER COLUMN "etape_actuelle" DROP DEFAULT;
ALTER TABLE "Postulation" ALTER COLUMN "etape_actuelle" TYPE "EtapeActuelle_new" USING ("etape_actuelle"::text::"EtapeActuelle_new");
ALTER TYPE "EtapeActuelle" RENAME TO "EtapeActuelle_old";
ALTER TYPE "EtapeActuelle_new" RENAME TO "EtapeActuelle";
DROP TYPE "EtapeActuelle_old";
ALTER TABLE "Postulation" ALTER COLUMN "etape_actuelle" SET DEFAULT 'SOUMIS';
COMMIT;

-- AlterTable
ALTER TABLE "Candidat" DROP COLUMN "password",
ADD COLUMN     "is_email_active" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Postulation" DROP COLUMN "telephone",
ADD COLUMN     "note" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Remarque" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "postulation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remarque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remarque" ADD CONSTRAINT "Remarque_postulation_id_fkey" FOREIGN KEY ("postulation_id") REFERENCES "Postulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
