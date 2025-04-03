const express = require('express');
const router = express.Router();
const processusController = require("../controllers/processus.controller");
const { IsAuthenticated, IsAuthenticatedAdmin, IsAuthenticatedCandidat } = require("../middlewares/auth.middleware");
const { createProcessusValidator, updateProcessusValidator } = require('../validators/processus.validatior');
const errorHandler = require('../middlewares/error.handler');
const { makeOrderTop, makeOrderBottom, reverseOrder } = require('../controllers/ordreProcees.controller');
const  createUpload  = require("../config/multer.config")


/**
 * @swagger
 * tags:
 *   name: Processus
 *   description: | 
 *       Gestion des processus
 *       ### Fonctionnalités :
 *       -  **Ajout, modification et suppression de processus**
 *       -  **Ajout, modification et suppression de question et réponse si l'offre n'est pas encore publié**
 *       -  **Ajout ajout quizz (question, réponse) si processus de type QUESTIONNAIRE**
 *       
 *       ### Pré-requis : 
 *       -  **Compte Admin et non admin pour effectuer actions** 
 *       -  **Offre déjà créé** 
 *       
 *       ### Fonctionnement : 
 *       -  **Créé une offre, ensuite après créé les processus lié à l'offre.**
 *       -  **Si le processus à créé est de type QUESTIONNAIRE, il faut ajouter un quizz (question, réponse) au processus**
 *       -  **L'ajout de quizz se fait par json, ou un à un via les routes de création question et réponse lié aux questions**
 *       -  **Une Offre ne peux pas être publié s'il n'a pas au moins un processus et au moins un question si quizz, et un réponse vrai pour une question** 
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
 *         offre_id:
 *           type: integer
 *           description: ID offres associé à la processus 
 *           example: 1 
 *         titre:
 *           type: string
 *           description: Titre du processus
 *           example: "Réunion hebdomadaire"
 *         type:
 *           type: string
 *           enum: [VISIO_CONFERENCE, PRESENTIEL, HYBRIDE, QUESTIONNAIRE]
 *           description: Type de processus
 *           example: "QUESTIONNAIRE"
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
 *         ordre:
 *           type: integer
 *           description: ordre dans le processus de recrutement 
 *           example: 60
 *         start_at: 
 *           type: string
 *           format: date-time
 *           description: Date de commencement
 *           example: "2025-03-18T10:00:00.000Z" 
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
 *       required:
 *         - id
 *         - titre
 *         - description
 *         - duree
 *         - ordre
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StartMeetingProcessRequest:
 *       type: object
 *       required:
 *         - users
 *         - candidats
 *         - start_time
 *         - start_date
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             type: integer
 *           description: Liste des IDs des utilisateurs
 *         candidats:
 *           type: array
 *           items:
 *             type: integer
 *           description: Liste des IDs des candidats
 *         start_time:
 *           type: string
 *           description: Heure de début au format HH:mm (exemple "14:30")
 *         start_date:
 *           type: string
 *           format: date
 *           description: Date de début au format YYYY-MM-DD (exemple "2025-04-10")
 *         duration:
 *           type: integer
 *           description: Durée en minutes
 *       example:
 *         processus_id: 2
 *         users: [1, 2]
 *         candidats: [3, 4]
 *         start_time: "14:30"
 *         start_date: "2025-04-10"
 * 
 *     StartMeetingProcessusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         meetLink:
 *           type: string
 *           description: Lien Google Meet généré
 *       example:
 *         success: true
 *         message: "Réunion planifiée et invitations envoyées avec succès"
 *         meetLink: "https://meet.google.com/abc-defg-hij"
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
 *               - offre_id
 *             properties:
 *               offre_id:
 *                 type: string
 *                 description: ID Offre du processus à créé 
 *                 example: "1"
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
 *     summary: Récupérer un processus par ID avec ses questions et réponses
 *     tags: [Processus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Processus récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 titre:
 *                   type: string
 *                   example: "Processus de recrutement"
 *                 type:
 *                   type: string
 *                   enum:
 *                     - TACHE
 *                     - VISIO_CONFERENCE
 *                     - QUESTIONNAIRE
 *                   example: "QUESTIONNAIRE"
 *                 description:
 *                   type: string
 *                   example: "Ce processus permet d'évaluer les candidats pour le poste."
 *                 statut:
 *                   type: string
 *                   enum:
 *                     - A_VENIR
 *                     - EN_COURS
 *                     - TERMINER
 *                     - ANNULER
 *                   example: "A_VENIR"
 *                 duree:
 *                   type: integer
 *                   example: 60
 *                 ordre:
 *                   type: integer
 *                   example: 1
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       label:
 *                         type: string
 *                         example: "Quelle est votre expérience ?"
 *                       reponses:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 100
 *                             label:
 *                               type: string
 *                               example: "J'ai 5 ans d'expérience."
 *                             is_true:
 *                               type: boolean
 *                               example: true
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
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


/**
 * @swagger
 * /api/processus/{id}/quizz:
 *   post:
 *     summary: Ajouter un quiz à un processus via un fichier JSON
 *     tags: [Processus, Quizz]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du processus auquel ajouter le quiz
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - label
 *                 - reponses
 *               properties:
 *                 label:
 *                   type: string
 *                   description: Libellé de la question
 *                   example: "Quelle est la capitale de la France ?"
 *                 reponses:
 *                   type: array
 *                   minItems: 1
 *                   items:
 *                     type: object
 *                     required:
 *                       - label
 *                       - is_true
 *                     properties:
 *                       label:
 *                         type: string
 *                         description: Texte de la réponse
 *                         example: "Paris"
 *                       is_true:
 *                         type: boolean
 *                         description: Indique si c'est la bonne réponse
 *                         example: true
 *           example:
 *             - label: "Quelle est la capitale de la France ?"
 *               reponses:
 *                 - label: "Paris"
 *                   is_true: true
 *                 - label: "Lyon"
 *                   is_true: false
 *             - label: "2 + 2 = ?"
 *               reponses:
 *                 - label: "4"
 *                   is_true: true
 *                 - label: "5"
 *                   is_true: false
 *     responses:
 *       201:
 *         description: Quiz ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz ajouté avec succès"
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Requête invalide - Type incorrect, processus non modifiable ou JSON mal formé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Impossible d'ajouter un quiz : le processus doit être de type QUESTIONNAIRE"
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token invalide ou manquant"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
 *       500:
 *         description: Erreur serveur lors de l'ajout du quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.post('/:id/quizz', IsAuthenticatedAdmin, processusController.addQuizzJson);

/**
 * @swagger
 * /api/processus/{id}/start:
 *   post:
 *     summary: Démarrer un processus de recrutement
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Démarre un processus de recrutement en fonction de son type (questionnaire, tâche, visio-conférence) et envoie les notifications aux candidats.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à démarrer
 *     responses:
 *       200:
 *         description: Processus démarré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus de recrutement : Entretien Technique pour l'offre Développeur Backend a commencé."
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre encore ouverte ou processus déjà en cours"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
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
router.post("/:id/start", IsAuthenticated, processusController.startProcessus);

/**
 * @swagger
 * /api/processus/{id}/start-inacheve:
 *   post:
 *     summary: Démarrer un processus de recrutement pour les candidats inachevés
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Démarre un processus de recrutement pour les candidats qui n'ont pas encore commencé le processus spécifié. Envoie des notifications adaptées selon le type de processus (questionnaire, tâche, visio-conférence).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à démarrer
 *     responses:
 *       200:
 *         description: Processus démarré avec succès pour les candidats inachevés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Le processus \"Entretien Technique\" pour l'offre \"Développeur Backend\" a démarré avec succès"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre encore ouverte ou aucun candidat inachevé"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
 *       500:
 *         description: Erreur interne du serveur ou type de processus invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.post("/:id/start-inacheve", IsAuthenticated, processusController.startProcessusInacheve);

/**
 * @swagger
 * /api/processus/{id}/start-for-candidat:
 *   post:
 *     summary: Démarrer un processus de recrutement pour les candidats inachevés
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Démarre un processus de recrutement pour les candidats qui n'ont pas encore commencé le processus spécifié. Envoie des notifications adaptées selon le type de processus (questionnaire, tâche, visio-conférence).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à démarrer
 *     responses:
 *       200:
 *         description: Processus démarré avec succès pour les candidats inachevés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Le processus \"Entretien Technique\" pour l'offre \"Développeur Backend\" a démarré avec succès"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Offre encore ouverte ou aucun candidat inachevé"
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé"
 *       500:
 *         description: Erreur interne du serveur ou type de processus invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.post("/:id/start-for-candidat", IsAuthenticated, processusController.startProcessusForCandidats);

/**
 * @swagger
 * /api/processus/{id}/make-top:
 *   put:
 *     summary: Mettre un processus de recrutement en premier
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Mettre un processus de recrutement en premier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à mettre en premier
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus de recrutement en tête de list"
 *       404:
 *         description: Processus non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/make-top", IsAuthenticatedAdmin, makeOrderTop);

/**
 * @swagger
 * /api/processus/{id}/make-bottom:
 *   put:
 *     summary: Mettre un processus de recrutement en dernier
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Mettre un processus de recrutement en dernier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à mettre en dernier
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus de recrutement en tête de list"
 *       404:
 *         description: Processus non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id/make-bottom", IsAuthenticatedAdmin, makeOrderBottom);

/**
 * @swagger
 * /api/processus/{id1}/reverse-order/{id2}:
 *   put:
 *     summary: Inverser l'ordre de deux processus
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Inverser l'ordre de deux processus en fonction de leurs IDs.
 *     parameters:
 *       - in: path
 *         name: id1
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du premier processus
 *       - in: path
 *         name: id2
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du deuxième processus
 *     responses:
 *       200:
 *         description: Ordres des processus inversés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ordres des processus inversés avec succès"
 *       400:
 *         description: Les processus ne sont pas dans la même offre
 *       404:
 *         description: Un ou les deux processus introuvables
 *       500:
 *         description: Erreur interne du serveur
 */
router.put("/:id1/reverse-order/:id2", IsAuthenticatedAdmin, reverseOrder);


/**
 * @swagger
 * /api/processus/{id}/submit/quizz:
 *   post:
 *     summary: Soumettre un quiz pour un processus donné
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du processus
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submit:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: integer
 *                       description: ID de la question
 *                       example: 2
 *                     reponse:
 *                       type: integer
 *                       description: ID de la réponse sélectionnée
 *                       example: 1
 *             required:
 *               - submit
 *     responses:
 *       200:
 *         description: Quiz soumis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: integer
 *                   example: 10
 *                 nombre_total_question:
 *                   type: integer
 *                   example: 20
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Processus non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/:id/submit/quizz",IsAuthenticatedCandidat,processusController.submitQuizz)


/**
 * @swagger
 * /api/processus/{id}/submit/tache:
 *   post:
 *     summary: Soumettre une tâche avec un fichier et/ou un lien
 *     tags: [Processus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du processus
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fichier:
 *                 type: string
 *                 description: URL AWS du fichier de preuve (optionnel)
 *                 example: "https://example.com/fichier.pdf"
 *               lien:
 *                 type: string
 *                 description: Lien vers le travail effectué (optionnel)
 *                 example: "https://example.com/travail"
 *     responses:
 *       200:
 *         description: Tâche soumise avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votre tâche a bien été reçue !"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Un fichier ou un lien est requis pour soumettre votre travail."
 *       404:
 *         description: Processus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus non trouvé."
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
 */
router.post("/:id/submit/tache", IsAuthenticatedCandidat, processusController.submitTache);

/**
 * @swagger
 * /api/processus/{id}/start/visio:
 *   post:
 *     summary: Commencer un visio avec un ou plusieurs candidats pour un processus donné
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du processus
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartMeetingProcessRequest'
 *     responses:
 *       '200':
 *         description: Réunion planifiée et invitations envoyées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartMeetingProcessusResponse'
 *       '400':
 *         description: Données invalides ou manquantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tous les champs sont requis : users, candidats, start_time, start_date, duration"
 *       '401':
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur non authentifié"
 *       '500':
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
router.post("/:id/start/visio",IsAuthenticatedAdmin,processusController.startVision)


/**
 * @swagger
 * /api/processus/{processus_id}/noter/{postulation_id}:
 *   post:
 *     summary: Attribuer une note à un candidat pour un processus donné
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processus_id
 *         required: true
 *         description: ID du processus
 *         schema:
 *           type: integer
 *       - in: path
 *         name: postulation_id
 *         required: true
 *         description: ID de la postulation du candidat
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: integer
 *                 description: Note attribuée au candidat
 *                 example: 10
 *     responses:
 *       200:
 *         description: Postulation du candidat notée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Postulation Candidat noté avec succès"
 *       400:
 *         description: Requête invalide (exemple processus non commencé ou note manquante)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note requis"
 *       404:
 *         description: Processus ou postulation non trouvé(e)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus ou Postulation cible introuvables"
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
router.post("/:processus_id/noter/postulation_id", IsAuthenticatedAdmin, processusController.giveNotePostulation)


/**
 * @swagger
 * /api/processus/{id}/terminate:
 *   post:
 *     summary: Marquer un processus comme terminé
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Permet de terminer un processus de recrutement s'il est en cours et que des candidats ont déjà été notés.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à terminer.
 *     responses:
 *       200:
 *         description: Processus marqué comme terminé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus marqué comme terminé."
 *       400:
 *         description: Impossible de terminer le processus.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aucun candidat n'a encore de note à ce processus."
 *       404:
 *         description: Processus non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus cible introuvable."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
 */
router.post("/:id/terminate", IsAuthenticatedAdmin, processusController.terminateProcessus)


/**
 * @swagger
 * /api/processus/{id}/annuler:
 *   post:
 *     summary: Annuler un processus de recrutement
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Permet d'annuler un processus de recrutement s'il n'a pas encore commencé.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à annuler.
 *     responses:
 *       200:
 *         description: Processus annulé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus annulé. Ce processus de recrutement ne sera plus pris en compte."
 *       400:
 *         description: Impossible d'annuler le processus.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus a déjà commencé."
 *       404:
 *         description: Processus non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processus cible introuvable."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
*/
router.post("/:id/annuler", IsAuthenticatedAdmin, processusController.cancelProcessus)


/**
 * @swagger
 * /api/processus/{id}/is-passed:
 *   get:
 *     summary: Vérifier si un utilisateur a déjà passé un processus
 *     tags: [Processus]
 *     security:
 *       - BearerAuth: []
 *     description: Permet de vérifier si un utilisateur a déjà passé un processus de recrutement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du processus à vérifier.
 *     responses:
 *       200:
 *         description: Résultat de la vérification du processus passé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Candidature à l'offre introuvable ou processus non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Candidature à l'offre introuvable."
 *       404:
 *         description: Processus ou candidature non trouvé(e).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Processus introuvable."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
 */
router.get("/:id/is-passed",IsAuthenticatedCandidat, processusController.isPassedProcessus)

module.exports = router;