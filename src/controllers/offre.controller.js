const Offre = require("../models/offre.model");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { Status, TypeProcessus } = require("@prisma/client");
const Candidat = require("../models/candidat.model");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const organisationId = parseInt(req.body.organisation_id);

        const userOrganisation = await prisma.organisation.findFirst({
            where: {
                id: organisationId,
                users: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!userOrganisation) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à créer une offre pour cette organisation." });
        }

        let relativeImageUrl = "";
        if (req.file) {
            const subDir = "offres";
            const uploadDir = path.join(__dirname, "../uploads", subDir);
            const originalName = req.file.originalname;
            const tempPath = path.join(uploadDir, req.file.filename);
            const finalPath = path.join(uploadDir, originalName);

            await fs.rename(tempPath, finalPath);
            relativeImageUrl = `/uploads/offres/${originalName}`;
        }

        const offreData = {
            ...req.body,
            user_id: userId,
            organisation_id: organisationId,
            image_url: relativeImageUrl,
            salaire: parseFloat(req.body.salaire),
            status: Status.CREE,
            nombre_requis: parseInt(req.body.nombre_requis || 1),
            date_limite: new Date(req.body.date_limite),
            horaire_ouverture: req.body.horaire_ouverture,
            horaire_fermeture: req.body.horaire_fermeture
        };

        const newOffre = await Offre.create(offreData);
        res.status(201).json(Offre.fromPrisma(newOffre, req.base_url));
    } catch (error) {
        console.error("Erreur lors de la création de l'offre:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);

        const existingOffre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: { organisation: true }
        });

        if (!existingOffre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        const userOrganisation = await prisma.organisation.findFirst({
            where: {
                id: existingOffre.organisation_id,
                users: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!userOrganisation) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette offre." });
        }

        if (existingOffre.status !== Status.CREE) {
            return res.status(401).json({ error: "Offre ne peut plus être modifiée." });
        }

        let updateData = { ...req.body };
        if (req.file) {
            const subDir = "offres";
            const uploadDir = path.join(__dirname, "../uploads", subDir);
            const originalName = req.file.originalname;
            const ext = path.extname(originalName);
            const baseName = path.basename(originalName, ext);
            const tempPath = path.join(uploadDir, req.file.filename);
            const finalPath = path.join(uploadDir, originalName);

            if (existingOffre.image_url && !existingOffre.image_url.includes("default-offre.png")) {
                const oldImagePath = path.join(__dirname, "../", existingOffre.image_url.replace(req.base_url, ""));
                await fs.unlink(oldImagePath).catch(() => {});
            }

            if (await fs.stat(finalPath).catch(() => false)) {
                const tempBuffer = await fs.readFile(tempPath);
                const tempHash = crypto.createHash("md5").update(tempBuffer).digest("hex");
                const existingBuffer = await fs.readFile(finalPath);
                const existingHash = crypto.createHash("md5").update(existingBuffer).digest("hex");

                if (tempHash === existingHash) {
                    await fs.unlink(tempPath);
                    updateData.image_url = `/uploads/offres/${originalName}`;
                } else {
                    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
                    const randomSuffix = Math.round(Math.random() * 1e9);
                    const newName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
                    const newPath = path.join(uploadDir, newName);
                    await fs.rename(tempPath, newPath);
                    updateData.image_url = `/uploads/offres/${newName}`;
                }
            } else {
                await fs.rename(tempPath, finalPath);
                updateData.image_url = `/uploads/offres/${originalName}`;
            }
        }

        if (updateData.salaire) updateData.salaire = parseFloat(updateData.salaire);
        if (updateData.nombre_requis) updateData.nombre_requis = parseInt(updateData.nombre_requis);
        if (updateData.date_limite) updateData.date_limite = new Date(updateData.date_limite);
        if (updateData.organisation_id) updateData.organisation_id = parseInt(updateData.organisation_id);

        const updatedOffre = await Offre.update(offreId, updateData);
        res.status(200).json(Offre.fromPrisma(updatedOffre, req.base_url));
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'offre:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOffre = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id), req.base_url);
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        if (offre.image_url && !offre.image_url.includes("default-offre.png")) {
            const imagePath = path.join(__dirname, "../", offre.image_url.replace(req.base_url, ""));
            await fs.unlink(imagePath).catch(() => {});
        }
        if (offre.status !== Status.CREE) {
            return res.status(401).json({ error: "Offre ne peut pas être supprimée, déjà publiée." });
        }
        await Offre.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOffreForce = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id), req.base_url);
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        if (offre.image_url && !offre.image_url.includes("default-offre.png")) {
            const imagePath = path.join(__dirname, "../", offre.image_url.replace(req.base_url, ""));
            await fs.unlink(imagePath).catch(() => {});
        }
        await Offre.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOffre = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id), req.base_url);
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        res.status(200).json(offre);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'offre:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllOffres = async (req, res) => {
    try {
        const offres = await Offre.getAll(req.base_url);
        res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAvalaibleOffres = async (req, res) => {
    try {
        const offres = await Offre.getAllAvailable(req.base_url);
        res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur get offre disponible:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.filterOffres = async (req, res) => {
    try {
        const {
            status,
            minNombreRequis,
            lieu,
            pays,
            type_emploi,
            salaire,
            devise,
            date_publication,
            text,
            organisation_id
        } = req.query;

        const filterConditions = {};

        if (status) filterConditions.status = status;
        if (minNombreRequis) filterConditions.nombre_requis = { gte: parseInt(minNombreRequis) };
        if (lieu) filterConditions.lieu = { contains: lieu, mode: "insensitive" };
        if (pays) filterConditions.pays = { contains: pays, mode: "insensitive" };
        if (type_emploi) filterConditions.type_emploi = { contains: type_emploi, mode: "insensitive" };        
        if (salaire) filterConditions.salaire = { gte: parseFloat(salaire) };
        if (devise) filterConditions.devise = devise;
        if (date_publication) filterConditions.created_at = { gte: new Date(date_publication) };
        if (organisation_id) filterConditions.organisation_id = parseInt(organisation_id);
        if (text) {
            filterConditions.OR = [
                { titre: { contains: text, mode: "insensitive" } },
                { description: { contains: text, mode: "insensitive" } }
            ];
        }

        const offres = await prisma.offre.findMany({
            where: filterConditions
        });

        res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors du filtrage des offres:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.searchOffres = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ error: "Le paramètre 'keyword' est requis pour la recherche" });
        }

        const offres = await Offre.search(keyword, req.base_url);
        res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la recherche des offres:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getProcessusByOffre = async (req, res) => {
    try {
        const offreId = parseInt(req.params.offreId);
        const processus = await Offre.getAllProcessus(offreId);
        res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération des processus:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.publishOffre = async (req, res) => {
    try {
        const offreId = parseInt(req.params.id);

        const offre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: {
                processus: {
                    include: {
                        questions: {
                            include: {
                                reponses: true
                            }
                        }
                    }
                }
            }
        });

        if (!offre) {
            return res.status(404).json({ error: "Offre introuvable." });
        }

        if (offre.status === Status.FERME) {
            return res.status(400).json({ error: "Interdit. Offre déjà fermée." });
        }

        if (offre.processus.length === 0) {
            return res.status(400).json({ error: "Il faut au moins ajouter un processus de recrutement avant de publier une offre." });
        }

        for (const processus of offre.processus) {
            if (processus.type === "QUESTIONNAIRE") {
                if (processus.questions.length === 0) {
                    return res.status(400).json({ error: "Il faut au moins ajouter une question avant de publier une offre avec un processus de questionnaire." });
                }

                for (const question of processus.questions) {
                    const hasCorrectAnswer = question.reponses.some(reponse => reponse.is_true === true);
                    if (!hasCorrectAnswer) {
                        return res.status(400).json({ error: `La question ID ${question.id} doit avoir au moins une réponse correcte.` });
                    }
                }
            }
        }

        await prisma.offre.update({
            where: { id: offreId },
            data: { status: Status.OUVERT }
        });

        return res.status(200).json({ message: "Offre publiée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la publication de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.postulerOffre = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id));
        let data = { ...req.body };

        if (!offre) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        if (offre.status !== Status.OUVERT) {
            return res.status(400).json({ message: "Postulation à cette offre n'est plus ouverte" });
        }

        let candidat = await Candidat.findByEmail(data.email);

        if (!candidat) {
            const dataCandidat = {
                nom: data.nom,
                email: data.email,
                telephone: data.telephone
            };
            candidat = await Candidat.create(dataCandidat);
        }

        const existingPostulation = await prisma.postulation.findFirst({
            where: {
                candidat_id: candidat.id,
                offre_id: offre.id
            }
        });

        if (existingPostulation) {
            return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
        }

        let cvUrl;
        let lettreMotivationUrl;

        if (req.files?.cv?.[0]?.path && req.files?.lettre_motivation?.[0]?.path) {
            try {
                await fs.access(req.files.cv[0].path);
                await fs.access(req.files.lettre_motivation[0].path);
            } catch (error) {
                console.error("Les fichiers n'ont pas été correctement transférés:", error);
                return res.status(400).json({ error: "Erreur lors du transfert des fichiers" });
            }

            const cvPath = req.files.cv[0].path;
            const lettreMotivationPath = req.files.lettre_motivation[0].path;

            cvUrl = `/uploads/cv/${req.files.cv[0].filename}`;
            lettreMotivationUrl = `/uploads/lettre_motivation/${req.files.lettre_motivation[0].filename}`;
        } else {
            return res.status(400).json({ error: "Les CV et lettre de motivation sont requis pour postuler." });
        }

        const postulation = await prisma.postulation.create({
            data: {
                candidat: { connect: { id: candidat.id } },
                offre: { connect: { id: offre.id } },
                cv: cvUrl,
                lettre_motivation: lettreMotivationUrl,
                source_site: data.source_site
            }
        });

        return res.status(200).json({ message: "Postulation effectuée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = exports;