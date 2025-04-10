const Organisation = require("../models/organisation.model");
const PostCarriere = require("../models/postcarriere.model");
const User = require("../models/user.model");
const prisma = require("../config/prisma.config");
const Offre = require("../models/offre.model");
const fs = require("fs").promises;
const AdminAudit = require("../models/adminaudit.model.js");

exports.createOrganisation = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const user = await User.getById(userId);
        const existingOrganisation = await Organisation.getUniqueOrganisation(req.body.nom, req.body.ville, req.body.adresse);
        if (existingOrganisation) {
            return res.status(400).json({ error: "Une organisation avec le même nom, ville et adresse existe déjà." });
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

        await AdminAudit.create(userId, "creation_organisation", `${user.name} a créé l'organisation "${newOrganisation.nom}"`);
        return res.status(201).json(newOrganisation);
    } catch (error) {
        console.error("Erreur lors de la création de l'organisation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOrganisation = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const user = await User.getById(userId);
        const organisationId = parseInt(req.params.id);
        const existingOrganisation = await Organisation.getById(organisationId);

        if (!existingOrganisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        let updateData = { ...req.body };
        const updatedOrganisation = await Organisation.update(organisationId, updateData);

        await AdminAudit.create(userId, "modification_organisation", `${user.name} a modifié l'organisation "${updatedOrganisation.nom}"`);
        return res.status(200).json(updatedOrganisation);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOrganisation = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const user = await User.getById(userId);
        const organisationId = parseInt(req.params.id);
        const organisation = await Organisation.getById(organisationId);

        if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        await Organisation.delete(organisationId);
        await AdminAudit.create(userId, "suppression_organisation", `${user.name} a supprimé l'organisation "${organisation.nom}"`);
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
        return res.status(200).json(await Organisation.getAll());
    } catch (error) {
        console.error("Erreur lors de la récupération des organisations:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOrganisationsFilter = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const user = await User.getById(userId, true);
        return res.status(200).json(user.organisations);
    } catch (error) {
        console.error("Erreur lors de la récupération des organisations:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllOrganisationsPublic = async (req, res) => {
    try {
        const organisations = await prisma.organisation.findMany({});
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

exports.getOffresByOrganisationPublic = async (req, res) => {
    try {
        const offres = await prisma.offre.findMany({
            where: {
                organisation_id: parseInt(req.params.id)
            }
        });
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
        return res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs dans l'organisation:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOrganisationDashboard = async (req, res) => {
    try {
        const organisationId = parseInt(req.params.id);
        if (isNaN(organisationId)) {
            return res.status(400).json({ error: "ID d'organisation invalide" });
        }

        const organisation = await prisma.organisation.findUnique({
            where: { id: organisationId },
            include: {
                users: true,
                offres: { include: { postulations: true, processus: true } },
                postcarieres: true,
                queueinvitation: true
            }
        });

        if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
        }

        const userStats = {
            total: organisation.users.length,
            moderators: organisation.users.filter(u => u.role === "MODERATEUR").length,
            admins: organisation.users.filter(u => u.role === "ADMINISTRATEUR").length,
            active: organisation.users.filter(u => u.is_active).length,
            verified: organisation.users.filter(u => u.is_verified).length
        };

        const offreStats = await prisma.offre.aggregate({
            where: { organisation_id: organisationId },
            _count: { id: true },
            _avg: { salaire: true }
        });

        const top3OffresByPostulations = await prisma.offre.findMany({
            where: { organisation_id: organisationId },
            take: 3,
            orderBy: { postulations: { _count: "desc" } },
            select: {
                id: true,
                titre: true,
                _count: { select: { postulations: true } }
            }
        });

        const last3Offres = await prisma.offre.findMany({
            where: { organisation_id: organisationId },
            take: 3,
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                titre: true,
                created_at: true
            }
        });

        const postulationStats = await prisma.postulation.aggregate({
            where: { offre: { organisation_id: organisationId } },
            _count: { id: true },
            _avg: { note: true }
        });

        const postulationsPerOffer = await prisma.offre.findMany({
            where: { organisation_id: organisationId },
            select: { _count: { select: { postulations: true } } }
        });
        const postulationCounts = postulationsPerOffer.map(o => o._count.postulations);
        const minPostulations = postulationCounts.length > 0 ? Math.min(...postulationCounts) : 0;
        const maxPostulations = postulationCounts.length > 0 ? Math.max(...postulationCounts) : 0;
        const avgPostulations = postulationCounts.length > 0 
            ? postulationCounts.reduce((a, b) => a + b, 0) / postulationCounts.length 
            : 0;

        const processusStats = await prisma.processus.aggregate({
            where: { offre: { organisation_id: organisationId } },
            _count: { id: true },
        });

        const processusByType = {
            tache: await prisma.processus.count({ where: { offre: { organisation_id: organisationId }, type: "TACHE" } }),
            questionnaire: await prisma.processus.count({ where: { offre: { organisation_id: organisationId }, type: "QUESTIONNAIRE" } })
        };

        const postulationsBySource = {
            linkedin: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "LINKEDIN" } }),
            indeed: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "INDEED" } }),
            jooble: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "JOOBLE" } }),
            francetravail: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "FRANCETRAVAIL" } }),
            messager: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "MESSAGER" } }),
            whatsapp: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "WHATSAPP" } }),
            instagram: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "INSTAGRAM" } }),
            telegram: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "TELEGRAM" } }),
            twitter: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "TWITTER" } }),
            quebecSite: await prisma.postulation.count({ where: { offre: { organisation_id: organisationId }, source_site: "QUEBEC_SITE" } })
        };

        const invitationStats = await prisma.queueInvitationOrganisation.aggregate({
            where: { organisation_id: organisationId },
            _count: { id: true }
        });

        const pendingInvitations = await prisma.queueInvitationOrganisation.count({
            where: { 
                organisation_id: organisationId, 
                expires_at: { gt: new Date() }
            }
        });

        const postCarriereStats = await prisma.postCarriere.aggregate({
            where: { organisation_id: organisationId },
            _count: { id: true }
        });

        const dashboardData = {
            id: organisation.id,
            name: organisation.nom,
            totalUsers: userStats.total,
            totalModerators: userStats.moderators,
            totalAdmins: userStats.admins,
            totalActiveUsers: userStats.active,
            totalVerifiedUsers: userStats.verified,
            totalOffres: offreStats._count.id,
            top3OffresByPostulations: top3OffresByPostulations.map(o => ({
                id: o.id,
                titre: o.titre,
                postulationCount: o._count.postulations
            })),
            last3Offres: last3Offres.map(o => ({
                id: o.id,
                titre: o.titre,
                createdAt: o.created_at
            })),
            totalPostulations: postulationStats._count.id,
            minPostulationsPerOffer: minPostulations,
            maxPostulationsPerOffer: maxPostulations,
            avgPostulationsPerOffer: Number(avgPostulations.toFixed(2)),
            avgSalary: offreStats._avg.salaire ? Number(offreStats._avg.salaire.toFixed(2)) : 0,
            totalProcessus: processusStats._count.id,
            processusByType,
            postulationsBySource,
            totalInvitations: invitationStats._count.id,
            pendingInvitations,
            totalPostCarriere: postCarriereStats._count.id
        };

        return res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Erreur dans getOrganisationDashboard:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques" });
    }
};

module.exports = exports;