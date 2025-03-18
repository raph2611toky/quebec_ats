const Postulation = require("../models/postulation.model");
const Candidat = require("../models/candidat.model");
const Referent = require("../models/referent.model");
const Offre = require("../models/offre.model");
const fs = require("fs").promises;
const path = require("path");

exports.createPostulation = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        if (!req.files || !req.files.cv) {
            return res.status(400).json({ error: "Un fichier CV est requis pour postuler" });
        }

        const subDir = "candidats";
        const uploadDir = path.join(__dirname, "../uploads", subDir);

        const cvFile = req.files.cv[0];
        const cvOriginalName = cvFile.originalname;
        const cvTempPath = path.join(uploadDir, cvFile.filename);
        const cvFinalPath = path.join(uploadDir, cvOriginalName);
        if (await fs.stat(cvFinalPath).catch(() => false)) {
            await fs.unlink(cvTempPath);
        } else {
            await fs.rename(cvTempPath, cvFinalPath);
        }
        const cvUrl = `${baseUrl}/uploads/candidats/${cvOriginalName}`;

        let lettreUrl = null;
        if (req.files && req.files.lettre_motivation) {
            const lettreFile = req.files.lettre_motivation[0];
            const lettreOriginalName = lettreFile.originalname;
            const lettreTempPath = path.join(uploadDir, lettreFile.filename);
            const lettreFinalPath = path.join(uploadDir, lettreOriginalName);
            if (await fs.stat(lettreFinalPath).catch(() => false)) {
                await fs.unlink(lettreTempPath);
            } else {
                await fs.rename(lettreTempPath, lettreFinalPath);
            }
            lettreUrl = `${baseUrl}/uploads/candidats/${lettreOriginalName}`;
        }

        const offre = await Offre.getById(parseInt(req.body.offre_id));
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        let candidat = await Candidat.findByEmail(req.body.email);
        if (!candidat) {
            candidat = await Candidat.create({
                email: req.body.email,
                nom: req.body.nom,
                telephone: req.body.telephone || null,
                image: `${baseUrl}/uploads/candidats/default.png`
            });
        }

        if (req.body.hasReferent === "true" && req.body.referents) {
            const referentsData = JSON.parse(req.body.referents);
            for (const refData of referentsData) {
                let referent = await Referent.findByEmail(refData.email);
                if (!referent) {
                    referent = await Referent.create({
                        email: refData.email,
                        nom: refData.nom,
                        telephone: refData.telephone,
                        recommendation: refData.recommendation || null,
                        statut: refData.statut
                    });
                }
                await Candidat.addReferent(candidat.id, referent.id);
            }
        }

        const postulationData = {
            candidat_id: candidat.id,
            offre_id: parseInt(req.body.offre_id),
            cv: cvUrl,
            lettre_motivation: lettreUrl,
            telephone: req.body.telephone || null,
            source_site: req.body.source_site
        };

        const newPostulation = await Postulation.create(postulationData);
        res.status(201).json(newPostulation);
    } catch (error) {
        console.error("Erreur lors de la création de la postulation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id));
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }
        res.status(200).json(postulation);
    } catch (error) {
        console.error("Erreur lors de la récupération de la postulation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllPostulations = async (req, res) => {
    try {
        const postulations = await Postulation.getAll();
        res.status(200).json(postulations);
    } catch (error) {
        console.error("Erreur lors de la récupération des postulations:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updatePostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id));
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const subDir = "candidats";
        const uploadDir = path.join(__dirname, "../uploads", subDir);

        let updateData = { ...req.body };
        if (req.files && req.files.cv) {
            const cvFile = req.files.cv[0];
            const cvOriginalName = cvFile.originalname;
            const cvTempPath = path.join(uploadDir, cvFile.filename);
            const cvFinalPath = path.join(uploadDir, cvOriginalName);
            if (await fs.stat(cvFinalPath).catch(() => false)) {
                await fs.unlink(cvTempPath);
            } else {
                await fs.rename(cvTempPath, cvFinalPath);
            }
            updateData.cv = `${baseUrl}/uploads/candidats/${cvOriginalName}`;
        }

        if (req.files && req.files.lettre_motivation) {
            const lettreFile = req.files.lettre_motivation[0];
            const lettreOriginalName = lettreFile.originalname;
            const lettreTempPath = path.join(uploadDir, lettreFile.filename);
            const lettreFinalPath = path.join(uploadDir, lettreOriginalName);
            if (await fs.stat(lettreFinalPath).catch(() => false)) {
                await fs.unlink(lettreTempPath);
            } else {
                await fs.rename(lettreTempPath, lettreFinalPath);
            }
            updateData.lettre_motivation = `${baseUrl}/uploads/candidats/${lettreOriginalName}`;
        }

        const updatedPostulation = await Postulation.update(postulation.id, updateData);
        res.status(200).json(updatedPostulation);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la postulation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deletePostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id));
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }

        await Postulation.delete(postulation.id);
        res.status(200).json({ message: "Postulation supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la postulation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};