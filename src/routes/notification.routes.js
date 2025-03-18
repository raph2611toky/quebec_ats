const express = require("express");
const router = express.Router();
const { getAllNotifications, deleteNotification } = require("../controllers/notification.controller");
const { IsAuthenticated } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - titre
 *         - contenu
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la notification
 *         titre:
 *           type: string
 *           description: Titre de la notification
 *         contenu:
 *           type: string
 *           description: Contenu de la notification
 *         est_lu:
 *           type: boolean
 *           description: Indique si la notification a été lue
 *           default: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *       example:
 *         id: 1
 *         titre: "Nouvelle postulation"
 *         contenu: "Une nouvelle postulation a été soumise pour l'offre #9."
 *         est_lu: false
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer toutes les notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", IsAuthenticated, getAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification supprimée avec succès"
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id", deleteNotification);

module.exports = router;