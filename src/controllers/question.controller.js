const Question = require("../models/question.model")
const Processus = require("../models/processus.model")
const {  StatutProcessus   } = require("@prisma/client")

exports.createQuestion = async (req, res) => {
    try {
        const processusId = parseInt(req.body.processus_id);

        const processus = await Processus.getById(processusId);
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({
                error: "Impossible de créer une question : le processus a déjà commencé ou est terminé",
            });
        }

        const questionData = {
            label: req.body.label,
            processus_id: processusId,
        };
        const newQuestion = await Question.create(questionData);
        return res.status(201).json(newQuestion);
    } catch (error) {
        console.error("Erreur lors de la création de la question:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOneQuestion = async (req, res) => {
    try {
        const question = await Question.getById(parseInt(req.params.id));
        if (!question) return res.status(404).json({ error: "Question non trouvée" });
        return res.status(200).json(question);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllQuestion = async (req, res) => {
    try {
        const questions = await Question.getAll();
        return res.status(200).json(questions);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllQuestionByProcessus = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);

        const processus = await Processus.getById(processusId);
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }


        const questions = await Question.getAll({
            where: {
                processus_id: processusId,
            },
            include: {
                reponses: true, 
            },
        });

        return res.status(200).json(questions);
    } catch (error) {
        console.error("Erreur lors de la récupération des questions par processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateQuestion =    async (req, res) => {
    try {
        const question = await Question.getById(parseInt(req.params.id));
        if (!question) return res.status(404).json({ error: "Question non trouvée" });
        const updatedQuestion = await Question.update(parseInt(req.params.id), req.body);
        return res.status(200).json(updatedQuestion);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteQuestion =     async (req, res) => {
    try {
        const question = await Question.getById(parseInt(req.params.id));
        if (!question) return res.status(404).json({ error: "Question non trouvée" });
        await Question.delete(parseInt(req.params.id));
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


