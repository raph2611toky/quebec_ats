const PostCarriere = require("../models/postcarriere.model");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const prisma = require("../config/prisma.config");
const { Status } = require("@prisma/client");
const Organisation = require("../models/organisation.model");

exports.createPostCarriere = async (req, res) => {
    try {
        const images = [];
        
        const organisation = await Organisation.getById(parseInt(req.body.organisation_id))
        if(!organisation){
            return res.status(400).json({message: "Organisation non trouvé."})
        }
        const newPost = await PostCarriere.create({
            titre: req.body.titre,
            contenu: req.body.contenu,
            organisation_id: parseInt(req.body.organisation_id),
            images, 
        }, req.base_url);

        const user= req.user
        await AdminAudit.create(user.id, "creation_postcarriere", `${user.name} a créé un post carrière dans l'organisation "${organisation.nom}"`);
        return res.status(201).json({
            message: "Post carrière créé avec succès",
            post: newPost,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur lors de la création du post carrière" });
    }
};

exports.updatePostCarriere = async (req, res) => {
    try {
        const existingPostCarriere = await PostCarriere.getById(parseInt(req.params.id), req.base_url);
        if (!existingPostCarriere) {
            return res.status(404).json({ error: "Post carrière non trouvé" });
        }

        let updateData = { ...req.body };
        const organisation = await Organisation.getById(parseInt(updateData.organisation_id))
        
        if (updateData.organisation_id) {
            updateData.organisation_id = parseInt(updateData.organisation_id);
        }
        const user= req.user;
        const updatedPostCarriere = await PostCarriere.update(parseInt(req.params.id), updateData, req.base_url);
        await AdminAudit.create(user.id, "modification_postcarriere", `${user.name} a modifié un post carrière dans l'organisation "${organisation.nom}"`);
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
        const organisation = await Organisation.getById(postCarriere.organisation_id)
        const user= req.user
        await PostCarriere.delete(parseInt(req.params.id));
        await AdminAudit.create(user.id, "suppresion_postcarriere", `${user.name} a supprimé un post carrière dans l'organisation "${organisation.nom}"`);
        return res.status(200).json({ message: "Post carrière supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostCarriere = async (req, res) => {
    try {
        const postCarriere = await PostCarriere.getById(parseInt(req.params.id), req.base_url);
        if (!postCarriere) {
            return res.status(404).json({ error: "Post carrière non trouvé" });
        }
        return res.status(200).json(postCarriere);
    } catch (error) {
        console.error("Erreur lors de la récupération du post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOffresOrganisationByPostCarriere = async (req, res) => {
    try {
        const postCarriereId = parseInt(req.params.id);

        const postCarriere = await prisma.postCarriere.findUnique({
            where: { id: postCarriereId },
            select: { organisation_id: true }
        });

        if (!postCarriere) {
            return res.status(404).json({ error: "PostCarriere non trouvé" });
        }

        const offres = await prisma.offre.findMany({
            where: { 
                organisation_id: postCarriere.organisation_id,
                status: "OUVERT"
            }                
        });

        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres via post carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};


exports.getAllPostCarieres = async (req, res) => {
    try {
        const postCarieres = await PostCarriere.getAll(req.base_url);
        return res.status(200).json(postCarieres);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts carrière:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = exports;