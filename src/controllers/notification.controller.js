const Notification = require("../models/notification.model");

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getAll();
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.getById(parseInt(req.params.id));
        if (!notification) {
            return res.status(404).json({ error: "Notification non trouvée" });
        }
        await Notification.delete(parseInt(req.params.id));
        res.status(200).json({ message: "Notification supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la notification:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};