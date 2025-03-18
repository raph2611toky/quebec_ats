const express = require("express");
const router = express.Router();
const { 
    getReferent, 
    getAllReferents,
    deleteReferent 
} = require("../controllers/referent.controller");

/**
 * @swagger
 * tags:
 *   name: Referents
 *   description: Gestion des référents
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Referent:
 *       type: object
 *       required:
 *         - email
 *         - nom
 *         - telephone
 *         - statut
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du référent
 *         email:
 *           type: string
 *           description: Adresse email du référent
 *         nom:
 *           type: string
 *           description: Nom complet du référent
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone
 *         recommendation:
 *           type: string
 *           description: Recommandation (optionnel)
 *           nullable: true
 *         statut:
 *           type: string
 *           description: Statut ou rôle du référent
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         candidats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               candidat:
 *                 $ref: '#/components/schemas/Candidat'
 *       example:
 *         id: 1
 *         email: "paul.martin@example.com"
 *         nom: "Paul Martin"
 *         telephone: "+0987654321"
 *         recommendation: "Excellent candidat"
 *         statut: "Manager"
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 *         candidats:
 *           - candidat:
 *               id: 1
 *               email: "jean.dupont@example.com"
 *               nom: "Jean Dupont"
 *               telephone: "+1234567890"
 *               image: "http://localhost:5000/uploads/candidats/default.png"
 */

/**
 * @swagger
 * /api/referents/{id}:
 *   get:
 *     summary: Récupérer un référent par ID
 *     tags: [Referents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du référent
 *     responses:
 *       200:
 *         description: Référent récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referent'
 *       404:
 *         description: Référent non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id", getReferent);

/**
 * @swagger
 * /api/referents:
 *   get:
 *     summary: Récupérer tous les référents
 *     tags: [Referents]
 *     responses:
 *       200:
 *         description: Liste des référents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Referent'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", getAllReferents);

/**
 * @swagger
 * /api/referents/{id}:
 *   delete:
 *     summary: Supprimer un référent
 *     tags: [Referents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du référent
 *     responses:
 *       200:
 *         description: Référent supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Référent supprimé avec succès"
 *       404:
 *         description: Référent non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id", deleteReferent);

module.exports = router;