const Referent = require("../models/referent.model");

exports.getReferent = async (req, res) => {
    try {
        const referent = await Referent.getById(parseInt(req.params.id));
        if (!referent) {
            return res.status(404).json({ error: "Référent non trouvé" });
        }
        res.status(200).json(referent);
    } catch (error) {
        console.error("Erreur lors de la récupération du référent:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllReferents = async (req, res) => {
    try {
        const referents = await Referent.getAll();
        res.status(200).json(referents);
    } catch (error) {
        console.error("Erreur lors de la récupération des référents:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteReferent = async (req, res) => {
    try {
        const referent = await Referent.getById(parseInt(req.params.id));
        if (!referent) {
            return res.status(404).json({ error: "Référent non trouvé" });
        }

        await Referent.delete(referent.id);
        res.status(200).json({ message: "Référent supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du référent:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};