const express = require("express");
const router = express.Router();
const errorHandler = require("../middlewares/error.handler");
const { createQuestionValidator, updateQuestionValidator, idValidator } = require("../validators/question.validator");
const { createQuestion, getOneQuestion, getAllQuestion, updateQuestion, deleteQuestion, getAllQuestionByProcessus } = require("../controllers/question.controller");
const { IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de la question
 *           example: 1
 *         label:
 *           type: string
 *           description: Libellé de la question
 *           example: "Quelle est la capitale de la France ?"
 *         processus_id:
 *           type: integer
 *           description: ID du processus auquel la question est liée
 *           example: 1
 *         reponses:
 *           type: array
 *           description: Liste des réponses associées à la question
 *           items:
 *             $ref: '#/components/schemas/Reponse'
 *         processus:
 *           $ref: '#/components/schemas/Processus'
 *           description: Processus auquel la question est liée
 *       required:
 *         - id
 *         - label
 *         - processus_id
 */


/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Créer une nouvelle question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - processus_id
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Quelle est la capitale de la France ?"
 *               processus_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Question créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Données invalides ou processus non modifiable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Impossible de créer une question : le processus a déjà commencé ou est terminé"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
 *       500:
 *         description: Erreur serveur
 */
router.post(
    "/",
    IsAuthenticatedAdmin,
    createQuestionValidator,
    errorHandler,
    createQuestion  
);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Récupérer une question par ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question non trouvée
 */
router.get(
    "/:id",
    idValidator,
    errorHandler,
    getOneQuestion
);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Récupérer toutes les questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Liste des questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get("/", getAllQuestion);

/**
 * @swagger
 * /api/questions/processus/{id}:
 *   get:
 *     summary: Récupérer toutes les questions liées à un processus
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus (doit être de type QUESTIONNAIRE)
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des questions récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       400:
 *         description: Le processus n'est pas un questionnaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Le processus doit être de type QUESTIONNAIRE pour récupérer ses questions"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get(
    "/processus/:id",
    idValidator,
    errorHandler,
    getAllQuestionByProcessus
);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Mettre à jour une question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question non trouvée
 */
router.put(
    "/:id",
    IsAuthenticatedAdmin,
    updateQuestionValidator,
    errorHandler,
    updateQuestion
);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Supprimer une question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Question supprimée avec succès
 *       404:
 *         description: Question non trouvée
 */
router.delete(
    "/:id",
    IsAuthenticatedAdmin,
    idValidator,
    errorHandler,
    deleteQuestion
);

module.exports = router;