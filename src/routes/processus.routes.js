const express = require('express');
const router = express.Router();
const processusController = require("../controllers/processus.controller");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");
const { createProcessusValidator, updateProcessusValidator } = require('../validators/processus.validatior');
const errorHandler = require('../middlewares/error.handler');


/**
 * @swagger
 * tags:
 *   name: Processus
 *   description: Gestion des processus
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Processus:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique du processus
 *           example: 1
 *         titre:
 *           type: string
 *           description: Titre du processus
 *           example: "Réunion hebdomadaire"
 *         type:
 *           type: string
 *           enum: [VISIO_CONFERENCE, PRESENTIEL, HYBRIDE]
 *           description: Type de processus
 *           example: "VISIO_CONFERENCE"
 *         description:
 *           type: string
 *           description: Description du processus
 *           example: "Réunion d'équipe pour le suivi des projets"
 *         statut:
 *           type: string
 *           enum: [A_VENIR, EN_COURS, TERMINE, ANNULE]
 *           description: Statut actuel du processus
 *           example: "A_VENIR"
 *         duree:
 *           type: integer
 *           description: Durée en minutes
 *           example: 60
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: "2025-03-18T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *           example: "2025-03-18T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/processus:
 *   post:
 *     summary: Créer un nouveau processus
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - duree
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre du processus
 *                 example: "Test de compétence SQL"
 *               type:
 *                 type: string
 *                 enum: [VISIO_CONFERENCE, TACHE, QUESTIONNAIRE]
 *                 default: VISIO_CONFERENCE
 *                 description: Type de processus
 *               description:
 *                 type: string
 *                 description: Description détaillée du processus
 *                 example: "vidéo conférence pour tester compétence SQL"
 *               duree:
 *                 type: integer
 *                 description: Durée en minutes
 *                 example: 60
 *     responses:
 *       201:
 *         description: Processus créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Processus'
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *       400:
 *         description: Requête invalide - Données manquantes ou incorrectes
 */
router.post('/', IsAuthenticatedAdmin, createProcessusValidator, errorHandler, processusController.createProcessus);

/**
 * @swagger
 * /api/processus:
 *   get:
 *     summary: Récupérer tous les processus
 *     tags: [Processus]
 *     responses:
 *       200:
 *         description: Liste des processus récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Processus'
 *       500:
 *         description: Erreur serveur lors de la récupération des processus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get('/', processusController.getAllProcessus);

/**
 * @swagger
 * /api/processus/{id}:
 *   get:
 *     summary: Récupérer un processus par ID
 *     tags: [Processus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Processus créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Processus'
 */
router.get('/:id', processusController.getProcessus);

/**
 * @swagger
 * /api/processus/{id}:
 *   put:
 *     summary: Mettre à jour un processus
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre du processus
 *                 example: "Test de compétence SQL"
 *               type:
 *                 type: string
 *                 enum: [VISIO_CONFERENCE, TACHE, QUESTIONNAIRE]
 *                 default: VISIO_CONFERENCE
 *                 description: Type de processus
 *               description:
 *                 type: string
 *                 description: Description détaillée du processus
 *                 example: "vidéo conférence pour tester compétence SQL"
 *               duree:
 *                 type: integer
 *                 description: Durée en minutes
 *                 example: 60
 *     responses:
 *       200:
 *         description: Processus mis à jour
 */
router.put('/:id', IsAuthenticatedAdmin, updateProcessusValidator,errorHandler,processusController.updateProcessus);

/**
 * @swagger
 * /api/processus/{id}:
 *   delete:
 *     summary: Supprimer un processus
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du processus à supprimer
 *         example: 1
 *     responses:
 *       204:
 *         description: Processus supprimé avec succès
 *       400:
 *         description: Requête invalide - ID invalide ou mal formé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'ID doit être un nombre entier valide"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aucun processus trouvé avec cet ID"
 *       500:
 *         description: Erreur serveur lors de la suppression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.delete('/:id', IsAuthenticatedAdmin, processusController.deleteProcessus);

module.exports = router;