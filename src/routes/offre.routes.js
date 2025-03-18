const express = require("express");
const router = express.Router();
const { 
    createOffre,
    getOffre,
    getAllOffres,
    updateOffre,
    deleteOffre
} = require("../controllers/offre.controller");
const { createOffreValidationRules, updateOffreValidationRules } = require("../validators/offre.validator");
const validateHandler = require("../middlewares/error.handler");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");
const upload = require("../config/multer.config");

/**
 * @swagger
 * tags:
 *   name: Offres
 *   description: Gestion des offres d'emploi
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Offre:
 *       type: object
 *       required:
 *         - titre
 *         - user_id
 *         - image_url
 *         - description
 *         - date_limite
 *         - status
 *         - lieu
 *         - pays
 *         - type_emploi
 *         - salaire
 *         - devise
 *         - horaire_ouverture
 *         - horaire_fermeture
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'offre
 *         titre:
 *           type: string
 *           description: Titre de l'offre
 *         user_id:
 *           type: integer
 *           description: ID de l'utilisateur créateur
 *         image_url:
 *           type: string
 *           description: URL de l'image de l'offre
 *         description:
 *           type: string
 *           description: Description de l'offre
 *         date_limite:
 *           type: string
 *           format: date-time
 *           description: Date limite de l'offre
 *         status:
 *           type: string
 *           enum: [OUVERT, FERME]
 *           description: Statut de l'offre
 *         nombre_requis:
 *           type: integer
 *           description: Nombre de candidats requis
 *         lieu:
 *           type: string
 *           description: Lieu de l'emploi
 *         pays:
 *           type: string
 *           description: Pays de l'emploi
 *         type_emploi:
 *           type: string
 *           description: Type d'emploi (CDI, CDD, etc.)
 *         salaire:
 *           type: string
 *           description: Salaire (stocké comme BigInt)
 *         devise:
 *           type: string
 *           enum: [EURO, DOLLAR, DOLLAR_CANADIAN, LIVRE, YEN, ROUPIE, ARIARY]
 *           description: Devise du salaire
 *         horaire_ouverture:
 *           type: string
 *           description: Heure d'ouverture (format HH:mm:ss)
 *         horaire_fermeture:
 *           type: string
 *           description: Heure de fermeture (format HH:mm:ss)
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
 *         titre: "Développeur Full Stack"
 *         user_id: 1
 *         image_url: "https://res.cloudinary.com/example/offre_images/dev.jpg"
 *         description: "Poste de développeur Full Stack..."
 *         date_limite: "2025-04-30T23:59:59Z"
 *         status: "OUVERT"
 *         nombre_requis: 2
 *         lieu: "Paris"
 *         pays: "France"
 *         type_emploi: "CDI"
 *         salaire: "50000"
 *         devise: "EURO"
 *         horaire_ouverture: "09:00:00"
 *         horaire_fermeture: "17:00:00"
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/offres:
 *   get:
 *     summary: Récupérer toutes les offres
 *     tags: [Offres]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des offres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offre'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get("/", IsAuthenticated, getAllOffres);

/**
 * @swagger
 * /api/offres/{id}:
 *   get:
 *     summary: Récupérer une offre par ID
 *     tags: [Offres]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre
 *     responses:
 *       200:
 *         description: Détails de l'offre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offre'
 *       404:
 *         description: Offre non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre non trouvée"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get("/:id", IsAuthenticated, getOffre);

/**
 * @swagger
 * /api/offres:
 *   post:
 *     summary: Créer une nouvelle offre
 *     tags: [Offres]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - date_limite
 *               - status
 *               - lieu
 *               - pays
 *               - type_emploi
 *               - salaire
 *               - devise
 *               - horaire_ouverture
 *               - horaire_fermeture
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre de l'offre
 *                 example: "Développeur Full Stack"
 *               description:
 *                 type: string
 *                 description: Description de l'offre
 *                 example: "Poste de développeur Full Stack..."
 *               date_limite:
 *                 type: string
 *                 format: date-time
 *                 description: Date limite de l'offre
 *                 example: "2025-04-30T23:59:59Z"
 *               status:
 *                 type: string
 *                 enum: [OUVERT, FERME]
 *                 description: Statut de l'offre
 *                 example: "OUVERT"
 *               nombre_requis:
 *                 type: integer
 *                 description: Nombre de candidats requis (optionnel, 1 par défaut)
 *                 example: 2
 *               lieu:
 *                 type: string
 *                 description: Lieu de l'emploi
 *                 example: "Paris"
 *               pays:
 *                 type: string
 *                 description: Pays de l'emploi
 *                 example: "France"
 *               type_emploi:
 *                 type: string
 *                 description: Type d'emploi
 *                 example: "CDI"
 *               salaire:
 *                 type: string
 *                 description: Salaire
 *                 example: "50000"
 *               devise:
 *                 type: string
 *                 enum: [EURO, DOLLAR, DOLLAR_CANADIAN, LIVRE, YEN, ROUPIE, ARIARY]
 *                 description: Devise du salaire
 *                 example: "EURO"
 *               horaire_ouverture:
 *                 type: string
 *                 description: Heure d'ouverture (format HH:mm:ss)
 *                 example: "09:00:00"
 *               horaire_fermeture:
 *                 type: string
 *                 description: Heure de fermeture (format HH:mm:ss)
 *                 example: "17:00:00"
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: Image de l'offre (optionnel, image par défaut si non fournie)
 *     responses:
 *       201:
 *         description: Offre créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offre'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.post("/", IsAuthenticated, upload.single("image_url"), createOffreValidationRules, validateHandler, createOffre);

/**
 * @swagger
 * /api/offres/{id}:
 *   put:
 *     summary: Mettre à jour une offre
 *     tags: [Offres]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Nouveau titre
 *                 example: "Développeur Senior"
 *               description:
 *                 type: string
 *                 description: Nouvelle description
 *                 example: "Poste de développeur senior..."
 *               date_limite:
 *                 type: string
 *                 format: date-time
 *                 description: Nouvelle date limite
 *                 example: "2025-05-15T23:59:59Z"
 *               status:
 *                 type: string
 *                 enum: [OUVERT, FERME]
 *                 description: Nouveau statut
 *                 example: "FERME"
 *               nombre_requis:
 *                 type: integer
 *                 description: Nouveau nombre de candidats requis
 *                 example: 3
 *               lieu:
 *                 type: string
 *                 description: Nouveau lieu
 *                 example: "Lyon"
 *               pays:
 *                 type: string
 *                 description: Nouveau pays
 *                 example: "France"
 *               type_emploi:
 *                 type: string
 *                 description: Nouveau type d'emploi
 *                 example: "CDD"
 *               salaire:
 *                 type: string
 *                 description: Nouveau salaire
 *                 example: "60000"
 *               devise:
 *                 type: string
 *                 enum: [EURO, DOLLAR, DOLLAR_CANADIAN, LIVRE, YEN, ROUPIE, ARIARY]
 *                 description: Nouvelle devise
 *                 example: "EURO"
 *               horaire_ouverture:
 *                 type: string
 *                 description: Nouvelle heure d'ouverture (format HH:mm:ss)
 *                 example: "08:00:00"
 *               horaire_fermeture:
 *                 type: string
 *                 description: Nouvelle heure de fermeture (format HH:mm:ss)
 *                 example: "16:00:00"
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: Nouvelle image (optionnel)
 *     responses:
 *       200:
 *         description: Offre mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offre'
 *       404:
 *         description: Offre non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre non trouvée"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.put("/:id", IsAuthenticated, upload.single("image_url"), updateOffreValidationRules, validateHandler, updateOffre);

/**
 * @swagger
 * /api/offres/{id}:
 *   delete:
 *     summary: Supprimer une offre
 *     tags: [Offres]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre
 *     responses:
 *       200:
 *         description: Offre supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Offre supprimée avec succès"
 *       404:
 *         description: Offre non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre non trouvée"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.delete("/:id", IsAuthenticated, deleteOffre);

module.exports = router;