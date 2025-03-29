const Candidat = require("../models/candidat.model");
const Postulation = require("../models/postulation.model");
const Referent = require("../models/referent.model");
const fs = require("fs").promises;
const path = require("path");


exports.getCandidat = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id), req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }
        return res.status(200).json(candidat);
    } catch (error) {
        console.error("Erreur lors de la récupération du candidat:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getCandidatFullInfo = async (req, res) => {
    try {
        const candidatId = parseInt(req.params.id);

        const candidat = await Candidat.getById(candidatId, req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        const postulations = await prisma.postulation.findMany({
            where: { candidat_id: candidatId },
            include: {
                offre: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const referents = await prisma.candidatReferent.findMany({
            where: { candidat_id: candidatId },
            include: {
                referent: true
            }
        });

        const candidatFullInfo = {
            informations_personnelles: {
                id: candidat.id,
                nom: candidat.nom,
                email: candidat.email,
                telephone: candidat.telephone,
                image: candidat.image,
                created_at: candidat.created_at,
                updated_at: candidat.updated_at
            },
            postulations: postulations.map(post => ({
                id: post.id,
                date_soumission: post.date_soumission,
                etape_actuelle: post.etape_actuelle,
                cv: getFullUrl(post.cv, req.base_url),
                lettre_motivation: getFullUrl(post.lettre_motivation, req.base_url),
                telephone: post.telephone,
                source_site: post.source_site,
                offre: {
                    id: post.offre.id,
                    titre: post.offre.titre,
                    description: post.offre.description,
                    lieu: post.offre.lieu,
                    pays: post.offre.pays,
                    type_emploi: post.offre.type_emploi,
                    salaire: post.offre.salaire.toString(),
                    devise: post.offre.devise,
                    status: post.offre.status,
                    date_limite: post.offre.date_limite,
                    createur: {
                        id: post.offre.user.id,
                        nom: post.offre.user.name,
                        email: post.offre.user.email
                    }
                }
            })),
            referents: referents.map(ref => ({
                id: ref.referent.id,
                nom: ref.referent.nom,
                email: ref.referent.email,
                telephone: ref.referent.telephone,
                recommendation: ref.referent.recommendation,
                statut: ref.referent.statut,
                date_assignation: ref.assigned_at
            })),
            statistiques: {
                nombre_postulations: postulations.length,
                nombre_referents: referents.length,
                etapes_actuelles: {
                    soumis: postulations.filter(p => p.etape_actuelle === "SOUMIS").length,
                    en_revision: postulations.filter(p => p.etape_actuelle === "EN_REVISION").length,
                    entretien: postulations.filter(p => p.etape_actuelle === "ENTRETIEN").length,
                    accepte: postulations.filter(p => p.etape_actuelle === "ACCEPTE").length,
                    rejete: postulations.filter(p => p.etape_actuelle === "REJETE").length
                }
            }
        };

        return res.status(200).json(candidatFullInfo);
    } catch (error) {
        console.error("Erreur lors de la récupération des informations complètes du candidat:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    } finally {
        await prisma.$disconnect();
    }
};

const getFullUrl = (relativePath, base_url) => {
    if (!relativePath) return null;
    return `${base_url}${relativePath}`;
};

exports.getCandidatFullInfoByEmail = async (req, res) => {
    try {
        const email = req.params.email;

        const candidat = await Candidat.findByEmail(email, req.base_url);
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        req.params.id = candidat.id;
        return exports.getCandidatFullInfo(req, res);
    } catch (error) {
        console.error("Erreur lors de la récupération par email:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllCandidats = async (req, res) => {
    try {
        const candidats = await Candidat.getAll(req.base_url);
        return res.status(200).json(candidats);
    } catch (error) {
        console.error("Erreur lors de la récupération des candidats:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteCandidat = async (req, res) => {
    try {
        const candidat = await Candidat.getById(parseInt(req.params.id));
        if (!candidat) {
            return res.status(404).json({ error: "Candidat non trouvé" });
        }

        await Candidat.delete(candidat.id);
        return res.status(200).json({ message: "Candidat supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du candidat:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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
        return res.status(200).json({ message: "Référent ajouté avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'ajout du référent:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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
        return res.status(200).json({ message: "Référent supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du référent:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};