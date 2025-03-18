const express = require("express");
const router = express.Router();
const { 
    getCandidat, 
    getAllCandidats, 
    deleteCandidat, 
    addReferent, 
    removeReferent 
} = require("../controllers/candidat.controller");

/**
 * @swagger
 * tags:
 *   name: Candidats
 *   description: Gestion des candidats
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Candidat:
 *       type: object
 *       required:
 *         - email
 *         - nom
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du candidat
 *         email:
 *           type: string
 *           description: Adresse email du candidat
 *         nom:
 *           type: string
 *           description: Nom complet du candidat
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone (optionnel)
 *           nullable: true
 *         image:
 *           type: string
 *           description: URL de l'image du candidat
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         referents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               referent:
 *                 $ref: '#/components/schemas/Referent'
 *       example:
 *         id: 1
 *         email: "jean.dupont@example.com"
 *         nom: "Jean Dupont"
 *         telephone: "+1234567890"
 *         image: "http://localhost:5000/uploads/candidats/default.png"
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 *         referents:
 *           - referent:
 *               id: 1
 *               email: "ref@example.com"
 *               nom: "Paul Martin"
 *               telephone: "+0987654321"
 *               recommendation: "Excellent candidat"
 *               statut: "Manager"
 */

/**
 * @swagger
 * /api/candidats/{id}:
 *   get:
 *     summary: Récupérer un candidat par ID
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du candidat
 *     responses:
 *       200:
 *         description: Candidat récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidat'
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id", getCandidat);

/**
 * @swagger
 * /api/candidats:
 *   get:
 *     summary: Récupérer tous les candidats
 *     tags: [Candidats]
 *     responses:
 *       200:
 *         description: Liste des candidats récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidat'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", getAllCandidats);

/**
 * @swagger
 * /api/candidats/{id}:
 *   delete:
 *     summary: Supprimer un candidat
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du candidat
 *     responses:
 *       200:
 *         description: Candidat supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidat supprimé avec succès"
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id", deleteCandidat);

/**
 * @swagger
 * /api/candidats/{id}/referents:
 *   post:
 *     summary: Ajouter un référent à un candidat
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du candidat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referent_id:
 *                 type: integer
 *                 description: ID du référent à ajouter
 *             required:
 *               - referent_id
 *     responses:
 *       200:
 *         description: Référent ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Référent ajouté avec succès"
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/:id/referents", addReferent);

/**
 * @swagger
 * /api/candidats/{id}/referents:
 *   delete:
 *     summary: Supprimer un référent d'un candidat
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du candidat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referent_id:
 *                 type: integer
 *                 description: ID du référent à supprimer
 *             required:
 *               - referent_id
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
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id/referents", removeReferent);

module.exports = router;