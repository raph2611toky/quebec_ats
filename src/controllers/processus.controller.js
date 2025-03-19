const { StatutProcessus, TypeProcessus } = require("@prisma/client");
const Processus = require("../models/processus.model");
const Question = require("../models/question.model");


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
        if(processus.statut == StatutProcessus.EN_COURS){
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


exports.addQuizzJson = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);
        const processus = await Processus.getById(processusId);

        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        if (processus.type !== TypeProcessus.QUESTIONNAIRE) {
            return res.status(400).json({ 
                error: "Impossible d'ajouter un quiz : le processus doit être de type QUESTIONNAIRE" 
            });
        }

        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ 
                error: "Impossible d'ajouter un quiz : le processus a déjà commencé ou est terminé" 
            });
        }

        const quizzData = req.body;
        if (!Array.isArray(quizzData) || quizzData.length === 0) {
            return res.status(400).json({ 
                error: "Le fichier JSON doit contenir un tableau non vide de questions" 
            });
        }

        const createdQuestions = [];
        for (const questionData of quizzData) {
            if (!questionData.label || !Array.isArray(questionData.reponses) || questionData.reponses.length === 0) {
                return res.status(400).json({ 
                    error: "Chaque question doit avoir un label et au moins une réponse" 
                });
            }

            const newQuestion = await Question.create({
                label: questionData.label,
                processus_id: processusId,
                reponses: {
                    create: questionData.reponses.map(reponse => ({
                        label: reponse.label,
                        is_true: !!reponse.is_true // Convertit en booléen
                    }))
                }
            });
            createdQuestions.push(newQuestion);
        }

        res.status(201).json({
            message: "Quiz ajouté avec succès",
            questions: createdQuestions
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du quiz JSON:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

