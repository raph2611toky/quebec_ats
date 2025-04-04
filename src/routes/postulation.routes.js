const express = require("express");
const router = express.Router();
const { 
    createPostulation, 
    getPostulation, 
    getAllPostulations, 
    deletePostulation,
    confirmReferenceWithRecommendation,
    acceptPostulation,
    rejectPostulation,
    addRemarquePostulation,
    removeRemarquePostulation,
    getDetailsPostulation,
    getDetailsPostulationCandidat
} = require("../controllers/postulation.controller");
const { IsAuthenticated, IsAuthenticatedAdmin, IsAuthenticatedCandidat } = require("../middlewares/auth.middleware");
const createUpload = require("../config/multer.config");
const { validateRemarque } = require("../validators/postulation.validator");
const errorHandler = require("../middlewares/error.handler");

const upload = createUpload("candidats");

/**
 * @swagger
 * tags:
 *   name: Postulations
 *   description: |
 *       Gestion des postulations
 *       ### Fonctionnalités :
 *       -  **Ajout, modification et suppression de Postulation**
 *       
 *       ### Pré-requis : 
 *       -  **Compte candidat, ou pas de compte pour postuler pour créé postulation** 
 *       -  **Offre à postuler** 
 *       
 *       ### Fonctionnement : 
 *       -  **Un candidat postule à une offre - et de ce fait créé la table postulation**
 *       -  **En suite, le via son postulation il passe le processus créé au moment de création de l'offre**
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 description: URL AWS du fichier CV (obligatoire)
 *                 default: "https://example.com/cv.pdf"
 *               lettre_motivation:
 *                 type: string
 *                 description: URL AWS du fichier lettre de motivation (optionnel)
 *                 default: "https://example.com/lettre_motivation.pdf"
 *               email:
 *                 type: string
 *                 description: Email du candidat
 *                 default: "candidat@example.com"
 *               nom:
 *                 type: string
 *                 description: Nom du candidat
 *                 default: "Jean Dupont"
 *               telephone:
 *                 type: string
 *                 description: Téléphone du candidat (optionnel)
 *                 default: "0123456789"
 *               offre_id:
 *                 type: integer
 *                 description: ID de l'offre
 *                 default: 123
 *               source_site:
 *                 type: string
 *                 enum: [LINKEDIN, INDEED, JOOBLE, FRANCETRAVAIL, MESSAGER, WHATSAPP, INSTAGRAM, TELEGRAM, TWITTER, QUEBEC_SITE]
 *                 description: Source de la postulation
 *                 default: "LINKEDIN"
 *               hasReferent:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Indique si des référents sont inclus
 *                 default: "false"
 *               referents:
 *                 type: string
 *                 description: Tableau JSON de référents
 *                 example: '[{"email": "ref@example.com", "nom": "Paul", "telephone": "123", "recommendation": "Great", "statut": "Manager"}]'
 *                 default: '[{"email": "ref@example.com", "nom": "Paul", "telephone": "123", "recommendation": "Great", "statut": "Manager"}]'
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
 *         description: URL CV manquante
 *       404:
 *         description: Offre non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/", createPostulation);

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

/**
 * @swagger
 * /api/postulations/{id}/accept:
 *   put:
 *     summary: Accepter une postulation par ID
 *     tags: [Postulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation à accepter
 *     responses:
 *       200:
 *         description: Postulation acceptée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Erreur de validation 
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/accept", acceptPostulation);


/**
 * @swagger
 * /api/postulations/{id}/accept:
 *   put:
 *     summary: Accepter une postulation par ID
 *     tags: [Postulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation à accepter
 *     responses:
 *       200:
 *         description: Postulation acceptée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Erreur de validation 
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/accept", acceptPostulation);


/**
 * @swagger
 * /api/postulations/{id}/reject:
 *   put:
 *     summary: Rejeter une postulation par ID
 *     tags: [Postulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation à rejeter
 *     responses:
 *       200:
 *         description: Postulation rejeté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Erreur de validation 
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/accept", rejectPostulation);


/**
 * @swagger
 * /api/postulations/{id}/add-remarque:
 *   post:
 *     summary: Ajouter une remarque à une postulation par ID
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation cible
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: remarque textuelle
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Remarque ajouté 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Je trouve que c'est le meilleur candidat pour ce poste !"
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/:id/add-remarque", validateRemarque, IsAuthenticatedAdmin,  errorHandler,  addRemarquePostulation);


/**
 * @swagger
 * /api/postulations/{id}/all-remarque:
 *   get:
 *     summary: Liste tous remarque à une postulation par ID
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation cible
 *     responses:
 *       200:
 *         description: Remarques retourné 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Remarque retourné"
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/all-remarque", IsAuthenticatedAdmin, removeRemarquePostulation);

/**
 * @swagger
 * /api/postulations/{id}/remove-my-remarque:
 *   delete:
 *     summary: Supprimer une remarque à une postulation par ID
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la remarque cible
 *     responses:
 *       200:
 *         description: Remarque enlevé 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Remarque enlevé sur le postulation du candidat "
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete("/:id/remove-my-remarque", IsAuthenticatedAdmin,  removeRemarquePostulation);

/**
 * @swagger
 * /api/postulations/{id}/update-my-remarque:
 *   put:
 *     summary: Mettre à jour une remarque à une postulation par ID
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la remarque cible
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: remarque textuelle
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Remarque enlevé 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Remarque mis à jour."
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/update-my-remarque", IsAuthenticatedAdmin,  removeRemarquePostulation);


/**
 * @swagger
 * /api/postulations/{id}/details:
 *   get:
 *     summary: Details une postulation par ID (candidat, remarques, processus_passer)
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation cible
 *     responses:
 *       200:
 *         description: Details retourné 
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/details", IsAuthenticatedAdmin, getDetailsPostulation);


/**
 * @swagger
 * /api/postulations/{id}/details/me:
 *   get:
 *     summary: Details une postulation par ID (processus_passer, offres, offres.processus)
 *     tags: [Postulations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la postulation cible
 *     responses:
 *       200:
 *         description: Details retourné 
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/details/me", IsAuthenticatedCandidat, getDetailsPostulationCandidat);


module.exports = router;