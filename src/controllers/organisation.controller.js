const Organisation = require("../models/organisation.model");
const PostCarriere = require("../models/postcarriere.model")
const fs = require("fs").promises;

exports.createOrganisation = async (req, res) => {
    try {
        const organisationData = {
            ...req.body,
            users: req.body.users ? req.body.users.map(id => parseInt(id)) : undefined
        };

        const newOrganisation = await Organisation.create(organisationData);
        return res.status(201).json(newOrganisation);
    } catch (error) {
        console.error("Erreur lors de la création de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOrganisation = async (req, res) => {
    try {
        const existingOrganisation = await Organisation.getById(parseInt(req.params.id));
        if (!existingOrganisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        let updateData = { ...req.body };
        if (updateData.users) {
            updateData.users = Array.isArray(updateData.users)
                ? updateData.users.map(id => parseInt(id))
                : [parseInt(updateData.users)];
        }

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
        const offres = await Organisation.getOffresByOrganisation(parseInt(req.params.id));
        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostCarieresByOrganisation = async (req, res) => {
    try {
        const postCarieres = await PostCarriere.getByOrganisation(parseInt(req.params.id));
        return res.status(200).json(postCarieres);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts carrière de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};


module.exports = exports;