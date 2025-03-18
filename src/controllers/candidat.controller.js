const Candidat = require("../models/candidat.model");
const fs = require("fs").promises;
const path = require("path");


exports.getCandidat = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id), req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }
        res.status(200).json(candidat);
    } catch (error) {
        console.error("Erreur lors de la récupération du candidat:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllCandidats = async (req, res) => {
    try {
        const candidats = await Candidat.getAll(req.base_url);
        res.status(200).json(candidats);
    } catch (error) {
        console.error("Erreur lors de la récupération des candidats:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteCandidat = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id));
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        await Candidat.delete(candidat.id);
        res.status(200).json({ message: "Candidat supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du candidat:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.addReferent = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id), req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        const referentId = parseInt(req.body.referent_id);
        await Candidat.addReferent(candidat.id, referentId);
        res.status(200).json({ message: "Référent ajouté avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'ajout du référent:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.removeReferent = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id), req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        const referentId = parseInt(req.body.referent_id);
        await Candidat.removeReferent(candidat.id, referentId);
        res.status(200).json({ message: "Référent supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du référent:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};