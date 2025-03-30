const Organisation = require("../models/organisation.model");
const PostCarriere = require("../models/postcarriere.model")
const User = require("../models/user.model");
const fs = require("fs").promises;

exports.createOrganisation = async (req, res) => {
    try {
        const existingOrganisation = await Organisation.getUniqueOrganisation(req.body.nom, req.body.ville, req.body.adresse);
        if (existingOrganisation) {
            return res.status(400).json({
                error: "Une organisation avec le même nom, ville et adresse existe déjà."
            });
        }

        const admins = await User.getAlladmin();
        if (!admins || admins.length === 0) {
            return res.status(400).json({ error: "Aucun administrateur trouvé" });
        }

        const adminIds = admins.map(admin => parseInt(admin.id));

        const newOrganisation = await Organisation.create({
            ...req.body,
            users: adminIds
        });

        return res.status(201).json(newOrganisation);
    } catch (error) {
        console.error("Erreur lors de la création de l'organisation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOrganisation = async (req, res) => {
    try {
        const existingOrganisation = await Organisation.getById(parseInt(req.params.id));
        if (!existingOrganisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        let updateData = { ...req.body };
        // if (updateData.users) {
        //     updateData.users = Array.isArray(updateData.users)
        //         ? updateData.users.map(id => parseInt(id))
        //         : [parseInt(updateData.users)];
        // }

        const updatedOrganisation = await Organisation.update(parseInt(req.params.id), updateData);
        return res.status(200).json(updatedOrganisation);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};


exports.deleteOrganisation = async (req, res) => {
    try {
        const organisation = await Organisation.getById(parseInt(req.params.id));
        if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        await Organisation.delete(parseInt(req.params.id));
        return res.status(200).json({ message: "Organisation supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOrganisation = async (req, res) => {
    try {
        const organisation = await Organisation.getById(parseInt(req.params.id));
        if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }
        return res.status(200).json(organisation);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.getAll();
        return res.status(200).json(organisations);
    } catch (error) {
        console.error("Erreur lors de la récupération des organisations:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOffresByOrganisation = async (req, res) => {
    try {
        const offres = await Organisation.getOffresByOrganisation(parseInt(req.params.id), req.base_url);
        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostCarieresByOrganisation = async (req, res) => {
    try {
        const postCarieres = await PostCarriere.getByOrganisation(parseInt(req.params.id), req.base_url);
        return res.status(200).json(postCarieres);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts carrière de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getUsersByOrganisation = async (req, res) => {
    try {
        const users = await Organisation.getUsersByOrganisation(parseInt(req.params.id));
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisqteurs dans l'organisation:", error);
        res.status(400).json({ error: "Erreur interne du serveur" });
    }
};


module.exports = exports;