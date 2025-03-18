const express = require("express");
const router = express.Router();
const { 
    createPostulation, 
    getPostulation, 
    getAllPostulations, 
    deletePostulation,
    confirmReferenceWithRecommendation
} = require("../controllers/postulation.controller");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");
const createUpload = require("../config/multer.config");

const upload = createUpload("candidats");

/**
 * @swagger
 * tags:
 *   name: Postulations
 *   description: Gestion des postulations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Postulation:
 *       type: object
 *       required:
 *         - candidat_id
 *         - offre_id
 *         - cv
 *         - source_site
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la postulation
 *         candidat_id:
 *           type: integer
 *           description: ID du candidat
 *         offre_id:
 *           type: integer
 *           description: ID de l'offre
 *         date_soumission:
 *           type: string
 *           format: date-time
 *           description: Date de soumission
 *         etape_actuelle:
 *           type: string
 *           enum: [SOUMIS, EN_REVISION, ENTRETIEN, ACCEPTE, REJETE]
 *           description: Étape actuelle de la postulation
 *         cv:
 *           type: string
 *           description: URL du fichier CV
 *         lettre_motivation:
 *           type: string
 *           description: URL du fichier lettre de motivation (optionnel)
 *           nullable: true
 *         telephone:
 *           type: string
 *           description: Téléphone du candidat (optionnel)
 *           nullable: true
 *         source_site:
 *           type: string
 *           enum: [LINKEDIN, INDEED, JOOBLE, FRANCETRAVAIL, MESSAGER, WHATSAPP, INSTAGRAM, TELEGRAM, TWITTER, QUEBEC_SITE]
 *           description: Source de la postulation
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         candidat:
 *           $ref: '#/components/schemas/Candidat'
 *       example:
 *         id: 1
 *         candidat_id: 1
 *         offre_id: 1
 *         date_soumission: "2025-03-18T10:00:00Z"
 *         etape_actuelle: "SOUMIS"
 *         cv: "http://localhost:5000/uploads/candidats/cv.pdf"
 *         lettre_motivation: "http://localhost:5000/uploads/candidats/lettre.pdf"
 *         telephone: "+1234567890"
 *         source_site: "LINKEDIN"
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/postulations:
 *   post:
 *     summary: Créer une nouvelle postulation
 *     tags: [Postulations]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: Fichier CV (obligatoire)
 *               lettre_motivation:
 *                 type: string
 *                 format: binary
 *                 description: Fichier lettre de motivation (optionnel)
 *               email:
 *                 type: string
 *                 description: Email du candidat
 *               nom:
 *                 type: string
 *                 description: Nom du candidat
 *               telephone:
 *                 type: string
 *                 description: Téléphone du candidat (optionnel)
 *               offre_id:
 *                 type: integer
 *                 description: ID de l'offre
 *               source_site:
 *                 type: string
 *                 enum: [LINKEDIN, INDEED, JOOBLE, FRANCETRAVAIL, MESSAGER, WHATSAPP, INSTAGRAM, TELEGRAM, TWITTER, QUEBEC_SITE]
 *                 description: Source de la postulation
 *               hasReferent:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Indique si des référents sont inclus
 *               referents:
 *                 type: string
 *                 description: Tableau JSON de référents
 *                 example: '[{"email": "ref@example.com", "nom": "Paul", "telephone": "123", "recommendation": "Great", "statut": "Manager"}]'
 *             required:
 *               - cv
 *               - email
 *               - nom
 *               - offre_id
 *               - source_site
 *     responses:
 *       201:
 *         description: Postulation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulation'
 *       400:
 *         description: Fichier CV manquant
 *       404:
 *         description: Offre non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/", upload.fields([{ name: "cv", maxCount: 1 }, { name: "lettre_motivation", maxCount: 1 }]), createPostulation);

/**
 * @swagger
 * /api/postulations/{id}:
 *   get:
 *     summary: Récupérer une postulation par ID
 *     tags: [Postulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation
 *     responses:
 *       200:
 *         description: Postulation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulation'
 *       404:
 *         description: Postulation non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id", getPostulation);

/**
 * @swagger
 * /api/postulations:
 *   get:
 *     summary: Récupérer toutes les postulations
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des postulations récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Postulation'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", IsAuthenticated, getAllPostulations);

/**
 * @swagger
 * /api/postulations/{id}:
 *   delete:
 *     summary: Supprimer une postulation
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation
 *     responses:
 *       200:
 *         description: Postulation supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Postulation supprimée avec succès"
 *       404:
 *         description: Postulation non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id", IsAuthenticatedAdmin, deletePostulation);

/**
 * @swagger
 * /api/postulations/confirm-reference:
 *   post:
 *     summary: Confirmer une référence avec une recommandation
 *     tags: [Postulations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recommendation:
 *                 type: string
 *                 description: Recommandation fournie par le référent
 *               encryptedToken:
 *                 type: string
 *                 description: Token chiffré contenant referent_id et candidat_id
 *             required:
 *               - recommendation
 *               - encryptedToken
 *             example:
 *               recommendation: "Candidat très compétent et motivé"
 *               encryptedToken: "iv:encrypted_data:auth_tag"
 *     responses:
 *       200:
 *         description: Référence confirmée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Référence confirmée avec succès"
 *                 referent:
 *                   $ref: '#/components/schemas/Referent'
 *       400:
 *         description: Paramètres manquants ou token invalide/expiré
 *       403:
 *         description: Référent non associé au candidat
 *       404:
 *         description: Postulation ou référent non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/confirm-reference", confirmReferenceWithRecommendation);

module.exports = router;