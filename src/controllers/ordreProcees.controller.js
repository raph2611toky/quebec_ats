require("dotenv").config()
const { StatutProcessus, TypeProcessus, Status } = require("@prisma/client");
const Processus = require("../models/processus.model");
const Question = require("../models/question.model");
const Offre = require("../models/offre.model");
const createGoogleMeet = require("../services/meet/googleMeet.services.js");
const { generateToken } = require("../utils/securite/jwt.js")
const { encryptAES } = require("../utils/securite/cryptographie.js")
const prisma = require("../config/prisma.config");
const { existingType, sendEmail } = require("../services/notifications/email")

exports.makeOrderTop = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);

        const processus = await prisma.processus.findUnique({
            where: { id: processusId }
        });

        if (!processus) {
            return res.status(404).json({ message: "Processus introuvable" });
        }

        const offre = await prisma.offre.findUnique({
            where: { id: processus.offre_id },
            include: {
                processus: {
                    orderBy: { ordre: 'asc' }
                }
            }
        });

        if(offre.status != Status.CREE){
            return res.status(400).json({ message: "Offre déjà publier" });
        }

        if (!offre) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        const updatedProcessus = [];
        let newOrder = 1;

        updatedProcessus.push({ id: processus.id, ordre: newOrder });

        for (const p of offre.processus) {
            if (p.id !== processus.id) {
                updatedProcessus.push({ id: p.id, ordre: ++newOrder });
            }
        }

        await prisma.$transaction(
            updatedProcessus.map(p =>
                prisma.processus.update({
                    where: { id: p.id },
                    data: { ordre: p.ordre }
                })
            )
        );

        return res.status(200).json({ message: "Ordre mis à jour avec succès" });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'ordre du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


exports.makeOrderBottom = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);

        const processus = await prisma.processus.findUnique({
            where: { id: processusId }
        });

        if (!processus) {
            return res.status(404).json({ message: "Processus introuvable" });
        }

        const offre = await prisma.offre.findUnique({
            where: { id: processus.offre_id },
            include: {
                processus: {
                    orderBy: { ordre: 'asc' }
                }
            }
        });

        if (!offre) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        const updatedProcessus = [];
        let newOrder = 1;

        for (const p of offre.processus) {
            if (p.id !== processus.id) {
                updatedProcessus.push({ id: p.id, ordre: newOrder++ });
            }
        }

        updatedProcessus.push({ id: processus.id, ordre: newOrder });

        await prisma.$transaction(
            updatedProcessus.map(p =>
                prisma.processus.update({
                    where: { id: p.id },
                    data: { ordre: p.ordre }
                })
            )
        );

        return res.status(200).json({ message: "Ordre mis à jour avec succès" });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'ordre du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};




exports.reverseOrder = async (req, res) => {
    try {
        const { id1, id2 } = req.params; 

        const processus1 = await prisma.processus.findUnique({
            where: { id: parseInt(id1) }
        });

        const processus2 = await prisma.processus.findUnique({
            where: { id: parseInt(id2) }
        });

        if (!processus1 || !processus2) {
            return res.status(404).json({ message: "Un ou les deux processus introuvables" });
        }

        if (processus1.offre_id !== processus2.offre_id) {
            return res.status(400).json({ message: "Les processus doivent appartenir à la même offre" });
        }

        const ordre1 = processus1.ordre;
        const ordre2 = processus2.ordre;

        await prisma.$transaction([
            prisma.processus.update({
                where: { id: parseInt(id1) },
                data: { ordre: ordre2 }
            }),
            prisma.processus.update({
                where: { id: parseInt(id2) },
                data: { ordre: ordre1 }
            })
        ]);

        return res.status(200).json({ message: "Ordres des processus inversés avec succès" });

    } catch (error) {
        console.error("Erreur lors de l'inversion des ordres des processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};



exports.updateOrder = async (req, res) => {
    try {
        
        return res.status(201).json({message: "Success"});
    } catch (error) {
        console.error("Erreur lors de la création du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


