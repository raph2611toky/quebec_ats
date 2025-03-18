const Offre = require("../models/offre.model");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
exports.createOffre = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        // Vérifier si un fichier est fourni, sinon retourner une erreur
        if (!req.file) {
            return res.status(400).json({ error: "Un fichier image est requis pour créer une offre" });
        }
        const originalName = req.file.originalname;

        const imageUrl = `${baseUrl}/uploads/offres/${originalName}`;

        const offreData = {
            ...req.body,
            user_id: parseInt(req.user.id),
            image_url: imageUrl,
            salaire: BigInt(req.body.salaire),
            nombre_requis: parseInt(req.body.nombre_requis || 1),
            date_limite: new Date(req.body.date_limite),
            horaire_ouverture: req.body.horaire_ouverture,
            horaire_fermeture: req.body.horaire_fermeture
        };

        const newOffre = await Offre.create(offreData);
        res.status(201).json(newOffre);
    } catch (error) {
        console.error("Erreur lors de la création de l'offre:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOffre = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const existingOffre = await Offre.getById(parseInt(req.params.id));
        if (!existingOffre) {
            return res.status(404).json({ error: "Offre non trouvée" });
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
                const oldImagePath = path.join(__dirname, "../..", existingOffre.image_url.replace(baseUrl, ""));
                await fs.unlink(oldImagePath).catch(() => {});
            }

            if (await fs.stat(finalPath).catch(() => false)) {
                const tempBuffer = await fs.readFile(tempPath);
                const tempHash = crypto.createHash("md5").update(tempBuffer).digest("hex");

                const existingBuffer = await fs.readFile(finalPath);
                const existingHash = crypto.createHash("md5").update(existingBuffer).digest("hex");

                if (tempHash === existingHash) {
                    await fs.unlink(tempPath);
                    updateData.image_url = `${baseUrl}/uploads/offres/${originalName}`;
                } else {
                    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
                    const randomSuffix = Math.round(Math.random() * 1e9);
                    const newName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
                    const newPath = path.join(uploadDir, newName);
                    await fs.rename(tempPath, newPath);
                    updateData.image_url = `${baseUrl}/uploads/offres/${newName}`;
                }
            } else {
                await fs.rename(tempPath, finalPath);
                updateData.image_url = `${baseUrl}/uploads/offres/${originalName}`;
            }
        }

        if (updateData.salaire) updateData.salaire = BigInt(updateData.salaire);
        if (updateData.nombre_requis) updateData.nombre_requis = parseInt(updateData.nombre_requis);
        if (updateData.date_limite) updateData.date_limite = new Date(updateData.date_limite);

        const updatedOffre = await Offre.update(parseInt(req.params.id), updateData);
        res.status(200).json(updatedOffre);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'offre:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOffre = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const offre = await Offre.getById(parseInt(req.params.id));
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        if (offre.image_url && !offre.image_url.includes("default-offre.png")) {
            const imagePath = path.join(__dirname, "../..", offre.image_url.replace(baseUrl, ""));
            await fs.unlink(imagePath).catch(() => {});
        }
        await Offre.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOffre = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id));
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        res.status(200).json(offre);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'offre:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllOffres = async (req, res) => {
    try {
        const offres = await Offre.getAll();
        res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};