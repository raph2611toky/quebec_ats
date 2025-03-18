const Offre = require("../models/offre.model");
const cloudinary = require("../config/cloudinary.config");
const fs = require("fs").promises;
const { uploadDefaultProfileImage } = require("../utils/cloudinary.utils");

exports.createOffre = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            await fs.access(req.file.path).catch(() => {
                throw new Error("Erreur lors du transfert de l'image");
            });
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "offre_images",
                use_filename: true,
                unique_filename: false
            });
            imageUrl = result.secure_url;
            await fs.unlink(req.file.path);
        } else {
            imageUrl = await uploadDefaultProfileImage();
        }

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

exports.updateOffre = async (req, res) => {
    try {
        const existingOffre = await Offre.getById(parseInt(req.params.id));
        if (!existingOffre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        let updateData = { ...req.body };
        if (req.file) {
            await fs.access(req.file.path).catch(() => {
                throw new Error("Erreur lors du transfert de l'image");
            });
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "offre_images",
                use_filename: true,
                unique_filename: false
            });
            updateData.image_url = result.secure_url;
            await fs.unlink(req.file.path);
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
        const offre = await Offre.getById(parseInt(req.params.id));
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        await Offre.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};