const prisma = require("@prisma/client");
const ReponsePreSelection = require("../models/reponsepreselection.model");



exports.deletePreSelection = async (req, res) => {
    try {
        const preselection = await ReponsePreSelection.getById(parseInt(req.params.id));
        if (!preselection) {
            return res.status(404).json({ error: "Reponse Préselection non trouvé" });
        }

        await ReponsePreSelection.delete(referent.id);
        return res.status(200).json({ message: "Reponse Préselection supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du référent:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

