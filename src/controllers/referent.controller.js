const Referent = require("../models/referent.model");
const AdminAudit = require("../models/adminaudit.model")

exports.getReferent = async (req, res) => {
    try {
        const referent = await Referent.getById(parseInt(req.params.id));
        if (!referent) {
            return res.status(404).json({ error: "Référent non trouvé" });
        }
        return res.status(200).json(referent);
    } catch (error) {
        console.error("Erreur lors de la récupération du référent:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllReferents = async (req, res) => {
    try {
        const referents = await Referent.getAll();
        return res.status(200).json(referents);
    } catch (error) {
        console.error("Erreur lors de la récupération des référents:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteReferent = async (req, res) => {
    try {
        const referent = await Referent.getById(parseInt(req.params.id));
        if (!referent) {
            return res.status(404).json({ error: "Référent non trouvé" });
        }

        await Referent.delete(referent.id);
        const admin = req.user
        await AdminAudit.create(admin.id, "suppresion_referent", `${admin.name} a supprimer le referent ${referent.nom}"`);

        return res.status(200).json({ message: "Référent supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du référent:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};