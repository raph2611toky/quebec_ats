const PostCarriere = require("../models/postcarriere.model");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

exports.createPostCarriere = async (req, res) => {
    try {
        const images = [];

        if (req.files && req.files.length > 0) {
            const subDir = "postcarriere";
            const uploadDir = path.join(__dirname, "../uploads", subDir);

            for (const file of req.files) {
                const originalName = file.originalname;
                const tempPath = path.join(uploadDir, file.filename);
                const ext = path.extname(originalName);
                const baseName = path.basename(originalName, ext);

                const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
                const randomSuffix = crypto.randomBytes(4).toString("hex");
                const uniqueName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
                const finalPath = path.join(uploadDir, uniqueName);

                await fs.rename(tempPath, finalPath);

                images.push(`/uploads/${subDir}/${uniqueName}`);
            }
        }

        const newPost = await PostCarriere.create({
            titre: req.body.titre,
            contenu: req.body.contenu,
            organisation_id: req.body.organisation_id,
            images, 
        });

        res.status(201).json({
            message: "Post carrière créé avec succès",
            post: newPost,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création du post carrière" });
    }
};

exports.updatePostCarriere = async (req, res) => {
    try {
        const existingPostCarriere = await PostCarriere.getById(parseInt(req.params.id));
        if (!existingPostCarriere) {
            return res.status(404).json({ error: "Post carrière non trouvé" });
        }

        let updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const subDir = "postcariere";
            const uploadDir = path.join(__dirname, "../uploads", subDir);
            let newImages = [];

            if (existingPostCarriere.images && existingPostCarriere.images.length > 0) {
                for (const image of existingPostCarriere.images) {
                    const imagePath = path.join(__dirname, "../", image);
                    await fs.unlink(imagePath).catch(() => {});
                }
            }

            for (const file of req.files) {
                const originalName = file.originalname;
                const tempPath = path.join(uploadDir, file.filename);
                const finalPath = path.join(uploadDir, originalName);

                if (await fs.stat(finalPath).catch(() => false)) {
                    const tempBuffer = await fs.readFile(tempPath);
                    const tempHash = crypto.createHash("md5").update(tempBuffer).digest("hex");
                    const existingBuffer = await fs.readFile(finalPath);
                    const existingHash = crypto.createHash("md5").update(existingBuffer).digest("hex");

                    if (tempHash === existingHash) {
                        await fs.unlink(tempPath);
                        newImages.push(`/uploads/postcariere/${originalName}`);
                    } else {
                        const ext = path.extname(originalName);
                        const baseName = path.basename(originalName, ext);
                        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
                        const randomSuffix = Math.round(Math.random() * 1e9);
                        const newName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
                        const newPath = path.join(uploadDir, newName);
                        await fs.rename(tempPath, newPath);
                        newImages.push(`/uploads/postcariere/${newName}`);
                    }
                } else {
                    await fs.rename(tempPath, finalPath);
                    newImages.push(`/uploads/postcariere/${originalName}`);
                }
            }
            updateData.images = newImages;
        }

        if (updateData.organisation_id) {
            updateData.organisation_id = parseInt(updateData.organisation_id);
        }

        const updatedPostCarriere = await PostCarriere.update(parseInt(req.params.id), updateData);
        return res.status(200).json(updatedPostCarriere);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deletePostCarriere = async (req, res) => {
    try {
        const postCarriere = await PostCarriere.getById(parseInt(req.params.id));
        if (!postCarriere) {
            return res.status(404).json({ error: "Post carrière non trouvé" });
        }

        if (postCarriere.images && postCarriere.images.length > 0) {
            for (const image of postCarriere.images) {
                const imagePath = path.join(__dirname, "../", image);
                await fs.unlink(imagePath).catch(() => {});
            }
        }

        await PostCarriere.delete(parseInt(req.params.id));
        return res.status(200).json({ message: "Post carrière supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostCarriere = async (req, res) => {
    try {
        const postCarriere = await PostCarriere.getById(parseInt(req.params.id));
        if (!postCarriere) {
            return res.status(404).json({ error: "Post carrière non trouvé" });
        }
        return res.status(200).json(postCarriere);
    } catch (error) {
        console.error("Erreur lors de la récupération du post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllPostCarieres = async (req, res) => {
    try {
        const postCarieres = await PostCarriere.getAll();
        return res.status(200).json(postCarieres);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = exports;