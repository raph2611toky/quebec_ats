const AdminAudit = require("../models/adminaudit.model");

exports.getAdminAuditById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const audit = await AdminAudit.getById(id);
        if (!audit) {
            return res.status(404).json({ error: "Audit non trouvé" });
        }
        return res.status(200).json(audit);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'audit:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllAdminAudits = async (req, res) => {
    try {
        const audits = await AdminAudit.getAll();
        return res.status(200).json(audits);
    } catch (error) {
        console.error("Erreur lors de la récupération des audits:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateAdminAudit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { admin_id, action, label } = req.body;

        const existingAudit = await AdminAudit.getById(id);
        if (!existingAudit) {
            return res.status(404).json({ error: "Audit non trouvé" });
        }

        const updateData = {};
        if (admin_id) updateData.admin_id = parseInt(admin_id);
        if (action) updateData.action = action;
        if (label) updateData.label = label;

        const updatedAudit = await AdminAudit.update(id, updateData);
        return res.status(200).json(updatedAudit);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'audit:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteAdminAudit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existingAudit = await AdminAudit.getById(id);
        if (!existingAudit) {
            return res.status(404).json({ error: "Audit non trouvé" });
        }

        await AdminAudit.delete(id);
        return res.status(200).json({ message: "Audit supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'audit:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = exports;