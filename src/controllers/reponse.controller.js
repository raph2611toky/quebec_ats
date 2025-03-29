const Reponse = require("../models/reponse.model")
const Question = require("../models/question.model")
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createResponseController = async (req, res) => {
    try {
        const questionId = parseInt(req.body.question_id);

        const question = await Question.getById(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question non trouvée" });
        }

        const reponseData = {
            label: req.body.label,
            is_true: req.body.is_true,
            question_id: questionId,
        };
        const newReponse = await prisma.reponse.create({
            data: reponseData,
        });

        const formattedReponse = {
            id: newReponse.id,
            label: newReponse.label,
            is_true: newReponse.is_true,
            question_id: newReponse.question_id,
        };

        return res.status(201).json(formattedReponse);
    } catch (error) {
        console.error("Erreur lors de la création de la réponse:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOneResponseController =     async (req, res) => {
    try {
        const reponse = await Reponse.getById(parseInt(req.params.id));
        if (!reponse) return res.status(404).json({ error: "Réponse non trouvée" });
        return res.status(200).json(reponse);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllResponseController =async (req, res) => {
    try {
        const reponses = await Reponse.getAll();
        return res.status(200).json(reponses);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


exports.getAllReponseByQuestion = async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);

        const question = await Question.getById(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question non trouvée" });
        }

        const reponses = await prisma.reponse.findMany({
            where: { question_id: questionId },
            include: {
                question: true, 
            },
        });

        const formattedReponses = reponses.map(Reponse.fromPrisma);
        return res.status(200).json(formattedReponses);
    } catch (error) {
        console.error("Erreur lors de la récupération des réponses par question:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateResponseController =     async (req, res) => {
    try {
        const reponse = await Reponse.getById(parseInt(req.params.id));
        if (!reponse) return res.status(404).json({ error: "Réponse non trouvée" });
        const updatedReponse = await Reponse.update(parseInt(req.params.id), req.body);
        return res.status(200).json(updatedReponse);
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteResponseController = async (req, res) => {
    try {
        const reponse = await Reponse.getById(parseInt(req.params.id));
        if (!reponse) return res.status(404).json({ error: "Réponse non trouvée" });
        await Reponse.delete(parseInt(req.params.id));
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};



