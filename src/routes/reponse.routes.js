const express = require("express");
const router = express.Router();
const { createReponseValidator, updateResponseValidator } = require("../validators/reponse.validator");
const errorHandler = require("../middlewares/error.handler");
const { createResponseController, getOneResponseController, getAllResponseController, updateResponseController, deleteResponseController, getAllReponseByQuestion } = require("../controllers/reponse.controller");
const { idValidator } = require("../validators/question.validator");
const { IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Reponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de la réponse
 *           example: 1
 *         label:
 *           type: string
 *           description: Texte de la réponse
 *           example: "Paris"
 *         is_true:
 *           type: boolean
 *           description: Indique si c'est la bonne réponse
 *           example: true
 *         question_id:
 *           type: integer
 *           description: ID de la question à laquelle la réponse est liée
 *           example: 1
 *         question:
 *           $ref: '#/components/schemas/Question'
 *           description: Question à laquelle la réponse est liée (optionnel)
 *       required:
 *         - id
 *         - label
 *         - is_true
 *         - question_id
 */

/**
 * @swagger
 * /api/reponses:
 *   post:
 *     summary: Créer une nouvelle réponse
 *     tags: [Reponses]
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
 *               - is_true
 *               - question_id
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Paris"
 *               is_true:
 *                 type: boolean
 *                 example: true
 *               question_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Réponse créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reponse'
 *       400:
 *         description: Données invalides
 */
router.post(
    "/",
    IsAuthenticatedAdmin,
    createReponseValidator,
    errorHandler,
    createResponseController
);

/**
 * @swagger
 * /api/reponses/{id}:
 *   get:
 *     summary: Récupérer une réponse par ID
 *     tags: [Reponses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réponse récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reponse'
 *       404:
 *         description: Réponse non trouvée
 */
router.get(
    "/:id",
    idValidator,
    errorHandler,
    getOneResponseController
);

/**
 * @swagger
 * /api/reponses:
 *   get:
 *     summary: Récupérer toutes les réponses
 *     tags: [Reponses]
 *     responses:
 *       200:
 *         description: Liste des réponses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reponse'
 */
router.get("/", getAllResponseController);


/**
 * @swagger
 * /api/reponses/question/{id}:
 *   get:
 *     summary: Récupérer toutes les réponses liées à une question
 *     tags: [Reponses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des réponses récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reponse'
 *       404:
 *         description: Question non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Question non trouvée"
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
    "/question/:id",
    idValidator,
    errorHandler,
    getAllReponseByQuestion
);

/**
 * @swagger
 * /api/reponses/{id}:
 *   put:
 *     summary: Mettre à jour une réponse
 *     tags: [Reponses]
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
 *               is_true:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Réponse mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reponse'
 *       404:
 *         description: Réponse non trouvée
 */
router.put(
    "/:id",
    IsAuthenticatedAdmin,
    updateResponseValidator,
    errorHandler,
    updateResponseController
);

/**
 * @swagger
 * /api/reponses/{id}:
 *   delete:
 *     summary: Supprimer une réponse
 *     tags: [Reponses]
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
 *         description: Réponse supprimée avec succès
 *       404:
 *         description: Réponse non trouvée
 */
router.delete(
    "/:id",
    IsAuthenticatedAdmin,
    idValidator,
    errorHandler,
    deleteResponseController
);


module.exports = router;