const express = require("express");
const router = express.Router();
const { 
    createOffre,
    getOffre,
    getAllOffres,
    updateOffre,
    deleteOffre,
    getAvalaibleOffres,
    filterOffres,
    searchOffres,
    getProcessusByOffre,
    publishOffre,
    postulerOffre,
    deleteOffreForce
} = require("../controllers/offre.controller");
const { createOffreValidationRules, updateOffreValidationRules, postulerOffreValidationRules } = require("../validators/offre.validator");
const validateHandler = require("../middlewares/error.handler");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");
const errorHandler = require("../middlewares/error.handler");
const createUpload = require("../config/multer.config");
const upload = createUpload("offres");

// Middleware pour gérer l'upload de CV et lettre_motivation
const uploadDocuments = (folder) => createUpload(folder).fields([
    { name: "cv", maxCount: 1 },
    { name: "lettre_motivation", maxCount: 1 }
]);
    

/**
 * @swagger
 * tags:
 *   name: Offres
 *   description: | 
 *       Gestion des offres d'emploi
 *       ### Fonctionnalités :
 *       -  **Ajout, modification et suppression de Offres**
 *       
 *       ### Pré-requis : 
 *       -  **Compte Admin pour effectué action** 
 *       
 *       ### Fonctionnement : 
 *       -  **Créé par admin**
 *       -  **Aprés création, offre status CREE, il faut ajouter processus pour pouvoir publier l'offre après**
 *       -  **Candidat postuler - et création table postulation**
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
 *           enum: [CREE, OUVERT, FERME]
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
 *         salaire: "50000.75"
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
router.get("/", getAllOffres);

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
 *           enum: [CREE, OUVERT, FERME]
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
 *         salaire: "50000.75"
 *         devise: "EURO"
 *         horaire_ouverture: "09:00:00"
 *         horaire_fermeture: "17:00:00"
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/offres/available:
 *   get:
 *     summary: Récupérer toutes les offres publié
 *     tags: [Offres]
 *     responses:
 *       200:
 *         description: Liste des offres publié (ouvert et fermé)
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
router.get("/available", getAvalaibleOffres);

/**
 * @swagger
 * /api/offres/filter:
 *   get:
 *     summary: Filtrer les offres
 *     tags: [Offres] 
 *     description: Filtrer les offres selon différents critères
 *     parameters:
 *       - in: query
 *         name: status
 *         enum: [CREE, OUVERT, FERME] 
 *         description: Le statut de l'offre (par exemple, "actif")
 *       - in: query
 *         name: minNombreRequis
 *         description: Nombre minimum requis
 *       - in: query
 *         name: lieu
 *         description: Lieu de l'offre
 *       - in: query
 *         name: pays
 *         description: Pays de l'offre
 *       - in: query
 *         name: type_emploi
 *         description: Type d'emploi (par exemple, "temps plein")
 *       - in: query
 *         name: salaire
 *         description: Salaire minimum de l'offre
 *       - in: query
 *         name: devise
 *         description: Devise du salaire
 *       - in: query
 *         name: date_publication
 *         description: Date de publication des offres (format YYYY-MM-DD)
 *       - in: query
 *         name: text
 *         description: texte à chercher dans titre et description offre 
 *     responses:
 *       200:
 *         description: Liste des offres filtrées
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/filter', filterOffres);

/**
 * @swagger
 * /api/offres/search:
 *   get:
 *     summary: Searcher offres ouvert selon critères
 *     tags: [Offres] 
 *     description: Rechercher des offres ouvert selon un mot-clé
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: Le mot-clé pour rechercher des offres
 *     responses:
 *       200:
 *         description: Liste des offres correspondant à la recherche
 *       400:
 *         description: Le paramètre 'keyword' est requis
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/search', searchOffres);

/**
 * @swagger
 * /api/offres/{offre_id}/processus:
 *   get:
 *     summary: Récupère tous les processus d'une offre spécifique
 *     tags: [Offres] 
 *     description: Retourne la liste des processus associés à une offre donnée via son ID.
 *     parameters:
 *       - in: path
 *         name: offre_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre pour laquelle récupérer les processus
 *     responses:
 *       200:
 *         description: Liste des processus récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   offre_id:
 *                     type: integer
 *                     example: 5
 *                   titre:
 *                     type: string
 *                     example: "Entretien téléphonique"
 *                   type:
 *                     type: string
 *                     example: "VISIO_CONFERENCE"
 *                   description:
 *                     type: string
 *                     example: "Premier entretien avec le recruteur"
 *                   statut:
 *                     type: string
 *                     example: "A_VENIR"
 *                   duree:
 *                     type: integer
 *                     example: 30
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Mauvaise requête (ID invalide)
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:offreId/processus", getProcessusByOffre);

/**
 * @swagger
 * /api/offres/{id}/publish:
 *   put:
 *     tags: [Offres]
 *     summary: Publier une offre après vérification des processus et questions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'offre à publier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offre publiée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Offre publiée avec succès."
 *       400:
 *         description: L'offre ne peut pas être publiée en raison de processus manquants ou de questions incomplètes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Offre introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre introuvable."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put("/:id/publish",IsAuthenticatedAdmin, publishOffre);


/**
 * @swagger
 * /api/offres/{id}:
 *   get:
 *     summary: Récupérer une offre par ID
 *     tags: [Offres]
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
router.get("/:id", getOffre);

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
 *                 enum: [CDD, CDI, STAGE]
 *               salaire:
 *                 type: string
 *                 description: Salaire
 *                 example: "50000.75"
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

/**
 * @swagger
 * /api/offres/force/{id}:
 *   delete:
 *     summary: Supprimer une offre de force
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
router.delete("/force/:id", IsAuthenticated, deleteOffreForce);

/**
 * @swagger
 * /api/offres/{id}/postuler:
 *   post:
 *     summary: Postuler à une nouvelle offre. Pour candidat non connecté.
 *     tags: [Offres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *               - lettre_motivation
 *               - nom
 *               - email
 *               - telephone
 *               - source_site
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV candidat 
 *               lettre_motivation:
 *                 type: string
 *                 format: binary
 *                 description: Lettre de Motivation du candidat 
 *               nom:
 *                 type: string
 *                 description: nom du candidat
 *                 example: "Jack"
 *               email:
 *                 type: string
 *                 description: email du candidat
 *                 example: "a.angelo.mada@gmail.com" 
 *               telephone:
 *                 type: string
 *                 description: numéro du candidat
 *                 example: "+263567890948"
 *               source_site:
 *                 type: string
 *                 enum: [LINKEDIN, INDEED, JOOBLE,MESSAGER,WHATSAPP,INSTAGRAM,TELEGRAM,QUEBEC_SITE] 
 *                 description: "site de redirection (optionnel : défaut LINKEDIN)"
 *                 example: "LINKEDIN"
 *     responses:
 *       200:
 *         description: Postulation effectuée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Postulation Offre effectuée avec succès."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.post("/:id/postuler",
uploadDocuments("documents"),postulerOffreValidationRules, errorHandler, postulerOffre);

module.exports = router;