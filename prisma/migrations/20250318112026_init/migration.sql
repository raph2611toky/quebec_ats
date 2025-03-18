-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `profile` VARCHAR(191) NOT NULL DEFAULT 'profile.png',
    `role` ENUM('MODERATEUR', 'ADMINISTRATEUR') NOT NULL DEFAULT 'MODERATEUR',
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `date_limite` DATETIME(3) NOT NULL,
    `status` ENUM('OUVERT', 'FERME') NOT NULL,
    `nombre_requis` INTEGER NOT NULL DEFAULT 1,
    `lieu` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `type_emploi` VARCHAR(191) NOT NULL,
    `salaire` BIGINT NOT NULL,
    `devise` ENUM('EURO', 'DOLLAR', 'DOLLAR_CANADIAN', 'LIVRE', 'YEN', 'ROUPIE', 'ARIARY') NOT NULL,
    `horaire` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL DEFAULT 'candidat.png',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Candidat_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Postulation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidat_id` INTEGER NOT NULL,
    `offre_id` INTEGER NOT NULL,
    `date_soumission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `etape_actuelle` ENUM('SOUMIS', 'EN_REVISION', 'ENTRETIEN', 'ACCEPTE', 'REJETE') NOT NULL DEFAULT 'SOUMIS',
    `cv` VARCHAR(191) NOT NULL,
    `lettre_motivation` VARCHAR(191) NULL,
    `source_site` ENUM('LINKEDIN', 'INDEED', 'JOOBLE', 'FRANCETRAVAIL', 'MESSAGER', 'WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'TWITTER', 'QUEBEC_SITE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Referance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `recommendation` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Referance_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Offre` ADD CONSTRAINT `Offre_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Postulation` ADD CONSTRAINT `Postulation_candidat_id_fkey` FOREIGN KEY (`candidat_id`) REFERENCES `Candidat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Postulation` ADD CONSTRAINT `Postulation_offre_id_fkey` FOREIGN KEY (`offre_id`) REFERENCES `Offre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
