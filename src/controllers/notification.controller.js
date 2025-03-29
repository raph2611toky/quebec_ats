const Notification = require("../models/notification.model");

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getAll();
        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.getById(parseInt(req.params.id));
        if (!notification) {
            return res.status(404).json({ error: "Notification non trouvée" });
        }
        await Notification.delete(parseInt(req.params.id));
        return res.status(200).json({ message: "Notification supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la notification:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};