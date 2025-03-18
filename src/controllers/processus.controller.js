const { StatutProcessus } = require("@prisma/client");
const Processus = require("../models/processus.model");

exports.createProcessus = async (req, res) => {
    try {
        const processusData = {
            ...req.body,
            duree: parseInt(req.body.duree)
        };
        const newProcessus = await Processus.create(processusData);
        res.status(201).json(newProcessus);
    } catch (error) {
        console.error("Erreur lors de la création du processus:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateProcessus = async (req, res) => {
    try {
        const existingProcessus = await Processus.getById(parseInt(req.params.id));
        if (!existingProcessus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }
        if(existingProcessus.statut != StatutProcessus.A_VENIR){
            return res.status(400).json({ error: "Processus qui a déjà commencé, ne peux plus être modifier" });
        }
        
        let updateData = { ...req.body };
        if (updateData.duree) updateData.duree = parseInt(updateData.duree);
        if (updateData.lien_visio === "") updateData.lien_visio = null;

        const updatedProcessus = await Processus.update(parseInt(req.params.id), updateData);
        res.status(200).json(updatedProcessus);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du processus:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteProcessus = async (req, res) => {
    try {
        const processus = await Processus.getById(parseInt(req.params.id));
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }
        if(existingProcessus.statut == StatutProcessus.EN_COURS){
            return res.status(400).json({ error: "Processus en cours, ne peux pas être supprimer" });
        }
        await Processus.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Processus supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du processus:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getProcessus = async (req, res) => {
    try {
        const processus = await Processus.getById(parseInt(req.params.id));
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }
        res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération du processus:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllProcessus = async (req, res) => {
    try {
        const processus = await Processus.getAll();
        res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération des processus:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
