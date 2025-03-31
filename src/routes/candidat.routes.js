const express = require("express");
const router = express.Router();
const { 
    getCandidat, getCandidatMe, 
    getAllCandidats, 
    deleteCandidat, 
    addReferent, 
    removeReferent,
    getCandidatFullInfo,
    getCandidatFullInfoByEmail, getCandidatFullInfoMe,
    googleCallbackLogic,
    loginWithGoogleLogic, getCandidatProcessus,
} = require("../controllers/candidat.controller");
const { googleCallback } = require('../middlewares/googleauthentication');
// const { loginWithGoogle } = require("../services/google/authentication")
const { IsAuthenticated, IsAuthenticatedAdmin, IsAuthenticatedCandidat } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   - name: Candidats
 *     description: |
 *       **Gestion des candidats**  
 *       Ce module permet de gérer les candidats inscrits.  
 *       
 *       ### Fonctionnalités :
 *       -  **Ajout, modification et suppression de candidats**
 *       -  **Ajout, Suppression référent d'un candidat**
 *       
 *       ### Pré-requis : 
 *       -  **Compte Admin et non admin pour effectuer actions** 
 *       
 *       ### Fonctionnement : 
 *       -  **Candidat - Au moment de postuler à une offre, on créé un compte pour le candidat si mail fournie pas compte existant**
 *       -  **Candidat - Seule les admins voit que les candidats a un compte et voir tous ces postulations et processus dans le recrutement**
 *       -  **Referant - Après avoir postuler à une offre, on propose au candidat de référé quelqu'un pour ajouté à sont postulation et utilisé dans autre futur postulation, visible pour admin**
 *       -  **Referant - Une fois le demand envoyé, le référant reçoit mail pour confirmé le référencement en ajoutant son note personnelle**
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
 *         password:
 *           type: string
 *           description: mot de passe candidat (optionnel)
 *           nullable: true
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
 *     security:
 *       - BearerAuth: []
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
router.get("/:id", IsAuthenticated, getCandidat);

/**
 * @swagger
 * /api/candidats/me:
 *   get:
 *     summary: Récupérer un candidat par token
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
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
router.get("/me", IsAuthenticatedCandidat, getCandidatMe);

/**
 * @swagger
 * /api/candidats:
 *   get:
 *     summary: Récupérer tous les candidats
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
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
router.get("/", IsAuthenticated, getAllCandidats);

/**
 * @swagger
 * /api/candidats/{id}:
 *   delete:
 *     summary: Supprimer un candidat
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
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
router.delete("/:id", IsAuthenticatedAdmin, deleteCandidat);

/**
 * @swagger
 * /api/candidats/{id}/referents:
 *   post:
 *     summary: Ajouter un référent à un candidat
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
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
router.post("/:id/referents", IsAuthenticated, addReferent);

/**
 * @swagger
 * /api/candidats/{id}/referents:
 *   delete:
 *     summary: Supprimer un référent d'un candidat
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
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
router.delete("/:id/referents", IsAuthenticated, removeReferent);

/**
 * @swagger
 * /api/candidats/full-info/by-id/{id}:
 *   get:
 *     summary: Récupérer toutes les informations d'un candidat par ID
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du candidat
 *     responses:
 *       200:
 *         description: Informations complètes du candidat récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidatFullInfo'
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/full-info/by-id/:id", IsAuthenticated, getCandidatFullInfo);

/**
 * @swagger
 * /api/candidats/full-info/by-email/{email}:
 *   get:
 *     summary: Récupérer toutes les informations d'un candidat par email
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email du candidat
 *     responses:
 *       200:
 *         description: Informations complètes du candidat récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidatFullInfo'
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/full-info/by-email/:email", IsAuthenticated, getCandidatFullInfoByEmail);

/**
 * @swagger
 * /api/candidats/full-info/me:
 *   get:
 *     summary: Récupérer toutes les informations d'un candidat par email
 *     tags: [Candidats]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Informations complètes du candidat récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidatFullInfo'
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/full-info/me", IsAuthenticatedCandidat, getCandidatFullInfoMe);

/**
 * @swagger
 * /api/candidats/auth/google:
 *   get:
 *     summary: Initier la connexion via Google
 *     tags: [Candidats]
 *     description: Redirige l'utilisateur vers la page de connexion Google pour l'authentification
 *     responses:
 *       302:
 *         description: Redirection vers la page d'authentification Google
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur
 */
router.get("/auth/google", loginWithGoogleLogic);

/**
 * @swagger
 * /api/candidats/auth/google/verify:
 *   post:
 *     summary: Vérifier le code d'authentification Google et générer un token
 *     tags: [Candidats]
 *     description: Reçoit un code de Google depuis le frontend, valide l'authentification et retourne un token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code d'autorisation fourni par Google
 *                 example: "4/0AX4XfW..."
 *     responses:
 *       200:
 *         description: Authentification réussie, retourne les informations du candidat et un token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 candidat_nom:
 *                   type: string
 *                   example: "Jean Dupont"
 *                 token_candidat:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie via Google"
 *       401:
 *         description: Échec de l'authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Échec de l'authentification"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur"
 */
router.post("/auth/google/verify", googleCallbackLogic);

/**
 * @swagger
 * tags:
 *   name: Candidat Processus
 *   description: Gestion des processus de recrutement pour les candidats
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessusCandidatResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID du processus
 *         titre:
 *           type: string
 *           description: Titre du processus
 *         type:
 *           type: string
 *           enum: [TACHE, VISIO_CONFERENCE, QUESTIONNAIRE]
 *           description: Type du processus
 *         description:
 *           type: string
 *           description: Description du processus
 *         statut:
 *           type: string
 *           enum: [A_VENIR, EN_COURS, TERMINER, ANNULER]
 *           description: Statut actuel du processus
 *         duree:
 *           type: integer
 *           description: Durée en minutes
 *         offre:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             titre:
 *               type: string
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               label:
 *                 type: string
 *               ordre:
 *                 type: integer
 *               reponses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     label:
 *                       type: string
 *                     is_true:
 *                       type: boolean
 *       example:
 *         id: 1
 *         titre: "Évaluation technique"
 *         type: "QUESTIONNAIRE"
 *         description: "Évaluation technique - Répondez aux questions"
 *         statut: "EN_COURS"
 *         duree: 30
 *         offre:
 *           id: 1
 *           titre: "Développeur Senior"
 *         questions:
 *           - id: 1
 *             label: "Quelle est la capitale de la France ?"
 *             ordre: 1
 *             reponses:
 *               - id: 1
 *                 label: "Paris"
 *                 is_true: true
 *               - id: 2
 *                 label: "Londres"
 *                 is_true: false
 */

/**
     * @swagger
     * /api/candidat/processus/check:
     *   post:
     *     summary: Récupérer les détails d'un processus pour un candidat authentifié
     *     tags: [Candidat Processus]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *                 description: Token JWT reçu dans l'email
     *             required:
     *               - token
     *           example:
     *             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *     responses:
     *       200:
     *         description: Détails du processus récupérés avec succès
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/ProcessusCandidatResponse'
     *       400:
     *         description: Token invalide ou données manquantes
     *       401:
     *         description: Non autorisé (candidat non authentifié ou mismatch)
     *       404:
     *         description: Processus non trouvé ou accès non autorisé
     *       500:
     *         description: Erreur interne du serveur
     */
router.get("/processus/check", IsAuthenticatedCandidat, getCandidatProcessus);

module.exports = router;