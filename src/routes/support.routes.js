const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const {IsAuthenticated} = require("../middlewares/auth.middleware")

/**
 * @swagger
 * components:
 *   schemas:
 *     SupportRequest:
 *       type: object
 *       required:
 *         - type
 *         - sujet
 *         - contenu
 *         - emailSource
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique auto-incrémenté de la demande de support
 *         type:
 *           type: string
 *           enum: [CANDIDAT, RESPONSABLE]
 *           description: Type de la demande, indiquant si elle provient d'un candidat ou d'un responsable
 *         sujet:
 *           type: string
 *           description: Sujet ou titre de la demande de support
 *         contenu:
 *           type: string
 *           description: Description détaillée du problème ou de la demande
 *         emailSource:
 *           type: string
 *           description: Adresse email de l'expéditeur, utilisée pour répondre à la demande
 *         statut:
 *           type: string
 *           enum: [EN_ATTENTE, EN_COURS, RESOLU, REJETE]
 *           description: Statut actuel de la demande (par défaut EN_ATTENTE)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date et heure de création de la demande
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date et heure de la dernière mise à jour de la demande
 *       example:
 *         id: 1
 *         type: CANDIDAT
 *         sujet: "Problème avec ma candidature"
 *         contenu: "Je ne peux pas télécharger mon CV."
 *         emailSource: "candidat@example.com"
 *         statut: EN_ATTENTE
 *         createdAt: "2025-04-04T10:00:00Z"
 *         updatedAt: "2025-04-04T10:00:00Z"
 */

/**
 * @swagger
 * /api/supports/admin/request:
 *   post:
 *     summary: Créer une demande de support pour les administrateurs
 *     description: Crée une demande de support sauvegardée dans la base de données et envoyée à tous les administrateurs.
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sujet
 *               - contenu
 *               - emailSource
 *             properties:
 *               sujet:
 *                 type: string
 *                 description: Sujet de la demande
 *               contenu:
 *                 type: string
 *                 description: Contenu détaillé de la demande
 *               emailSource:
 *                 type: string
 *                 description: Email de l'expéditeur pour les réponses
 *             example:
 *               type: CANDIDAT
 *               sujet: "Problème avec ma candidature"
 *               contenu: "Je ne peux pas télécharger mon CV."
 *               emailSource: "candidat@example.com"
 *     responses:
 *       201:
 *         description: Demande de support créée avec succès et envoyée aux administrateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *                   example: "Demande de support créée avec succès"
 *                 supportRequest:
 *                   $ref: '#/components/schemas/SupportRequest'
 *       400:
 *         description: Champs requis manquants ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tous les champs (type, sujet, contenu, emailSource) sont requis"
 *       500:
 *         description: Erreur interne du serveur lors de la création ou de l'envoi de l'email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la création de la demande"
 */
router.post('/admin/request', supportController.createAdminSupportRequest);

/**
 * @swagger
 * /api/supports/technical/request:
 *   post:
 *     summary: Créer une demande de support pour le support technique
 *     description: Envoie une demande de support directement au support technique sans la sauvegarder dans la base de données.
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sujet
 *               - contenu
 *               - emailSource
 *             properties:
 *               sujet:
 *                 type: string
 *                 description: Sujet de la demande
 *               contenu:
 *                 type: string
 *                 description: Contenu détaillé de la demande
 *               emailSource:
 *                 type: string
 *                 description: Email de l'expéditeur pour les réponses
 *             example:
 *               sujet: "Erreur 500 sur le site"
 *               contenu: "Le site plante quand je clique sur Postuler."
 *               emailSource: "candidat@example.com"
 *     responses:
 *       200:
 *         description: Demande envoyée au support technique avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *                   example: "Demande envoyée au support technique avec succès"
 *       400:
 *         description: Champs requis manquants ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tous les champs (sujet, contenu, emailSource) sont requis"
 *       500:
 *         description: Erreur interne du serveur lors de l'envoi de l'email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de l’envoi de la demande"
 */
router.post('/technical/request', supportController.createTechnicalSupportRequest);

/**
 * @swagger
 * /api/supports/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une demande
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [EN_ATTENTE, EN_COURS, RESOLU, REJETE]
 *             example:
 *               statut: EN_COURS
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 supportRequest:
 *                   $ref: '#/components/schemas/SupportRequest'
 *       400:
 *         description: Statut invalide
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/status', IsAuthenticated, supportController.updateSupportRequestStatus);

/**
 * @swagger
 * /api/supports/{id}:
 *   delete:
 *     summary: Supprimer une demande de support
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     responses:
 *       200:
 *         description: Demande supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', IsAuthenticated, supportController.deleteSupportRequest);

/**
 * @swagger
 * /api/supports:
 *   get:
 *     summary: Récupérer toutes les demandes de support
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupportRequest'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', IsAuthenticated, supportController.getAllSupportRequests);

/**
 * @swagger
 * /api/supports/{id}:
 *   get:
 *     summary: Récupérer une demande de support par ID
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande
 *     responses:
 *       200:
 *         description: Détails de la demande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportRequest'
 *       404:
 *         description: Demande non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', IsAuthenticated, supportController.getSupportRequestById);

module.exports = router;