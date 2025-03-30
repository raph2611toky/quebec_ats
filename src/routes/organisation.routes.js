const express = require("express");
const router = express.Router();
const organisationController = require("../controllers/organisation.controller");
const { IsAuthenticatedAdmin, IsAuthenticated } = require("../middlewares/auth.middleware")

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: | 
 *       Gestion des organisations
 *       
 *       ### Fonctionnalités :
 *       - **Création, modification, suppression et gestion des organisations**
 *       - **Association d'utilisateurs à une organisation**
 *       - **Consultation des offres et des posts carrière d'une organisation**
 *       
 *       ### Pré-requis : 
 *       - **Compte administrateur ou utilisateur avec permissions spécifiques**
 *       
 *       ### Fonctionnement : 
 *       - **Les organisations sont créées par un administrateur ou un utilisateur autorisé.**
 *       - **Chaque organisation possède un ensemble d'utilisateurs associés.**
 *       - **Les organisations peuvent publier des offres et des posts carrière.**
 *       - **Les utilisateurs peuvent consulter les offres et posts carrière d’une organisation.**
 *       - **Suppression d'une organisation entraîne la suppression de ses offres et posts carrière associés.**
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Organisation:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'organisation
 *         nom:
 *           type: string
 *           description: Nom de l'organisation
 *         adresse:
 *           type: string
 *           description: Adresse de l'organisation
 *         ville:
 *           type: string
 *           description: Ville de l'organisation
 *         users:
 *           type: array
 *           items:
 *             type: integer
 *           description: Liste des IDs des utilisateurs liés
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
 *         nom: "Tech Corp"
 *         adresse: "123 Avenue des Startups"
 *         ville: "Antananarivo"
 *         users: [1, 2, 3]
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/organisations:
 *   post:
 *     summary: Créer une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             Organisation:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de l'organisation
 *               adresse:
 *                 type: string
 *                 description: Adresse de l'organisation
 *               ville:
 *                 type: string
 *                 description: Ville de l'organisation
 *             example:
 *               nom: "Tech Corp"
 *               adresse: "123 Avenue des Startups"
 *               ville: "Antananarivo"
 *     responses:
 *       201:
 *         description: Organisation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organisation'
 *       400:
 *         description: Erreur lors de la création de l'organisation
 */
router.post("/", IsAuthenticatedAdmin, organisationController.createOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   put:
 *     summary: Modifier une organisation existante
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organisation'
 *     responses:
 *       200:
 *         description: Organisation mise à jour avec succès
 *       404:
 *         description: Organisation non trouvée
 */
router.put("/:id", IsAuthenticatedAdmin, organisationController.updateOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   delete:
 *     summary: Supprimer une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation à supprimer
 *     responses:
 *       200:
 *         description: Organisation supprimée avec succès
 *       404:
 *         description: Organisation non trouvée
 */
router.delete("/:id", IsAuthenticatedAdmin, organisationController.deleteOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   get:
 *     summary: Récupérer une organisation par ID
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Détails de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organisation'
 *       404:
 *         description: Organisation non trouvée
 */
router.get("/:id", IsAuthenticated, organisationController.getOrganisation);

/**
 * @swagger
 * /api/organisations:
 *   get:
 *     summary: Récupérer toutes les organisations
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des organisations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organisation'
 */
router.get("/", IsAuthenticatedAdmin, organisationController.getAllOrganisations);

/**
 * @swagger
 * /api/organisations/{id}/offres:
 *   get:
 *     summary: Récupérer les offres d'une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Liste des offres de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offre'
 */
router.get("/:id/offres", IsAuthenticatedAdmin, organisationController.getOffresByOrganisation);

/**
 * @swagger
 * /api/organisations/{id}/postcarieres:
 *   get:
 *     summary: Récupérer les posts carrière d'une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Liste des posts carrière de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostCarriere'
 */
router.get("/:id/postcarieres", IsAuthenticatedAdmin, organisationController.getPostCarieresByOrganisation);

/**
 * @swagger
 * /api/organisations/{id}/users:
 *   get:
 *     summary: Récupérer les utilisateurs d'une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Liste des utilisateurs de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/:id/users", IsAuthenticatedAdmin, organisationController.getUsersByOrganisation);


/**
 * @swagger
 * /api/organisations/{id}/offres:
 *   get:
 *     summary: Récupérer les offres d'une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Liste des offres de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offre'
 */
router.get("/:id/offres", IsAuthenticatedAdmin, organisationController.getOffresByOrganisation);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganisationDashboardResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         totalUsers:
 *           type: integer
 *         totalModerators:
 *           type: integer
 *         totalAdmins:
 *           type: integer
 *         totalActiveUsers:
 *           type: integer
 *         totalVerifiedUsers:
 *           type: integer
 *         totalOffres:
 *           type: integer
 *         top3OffresByPostulations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               titre:
 *                 type: string
 *               postulationCount:
 *                 type: integer
 *         last3Offres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               titre:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         totalPostulations:
 *           type: integer
 *         minPostulationsPerOffer:
 *           type: integer
 *         maxPostulationsPerOffer:
 *           type: integer
 *         avgPostulationsPerOffer:
 *           type: number
 *         avgSalary:
 *           type: number
 *         totalProcessus:
 *           type: integer
 *         processusByType:
 *           type: object
 *           properties:
 *             tache:
 *               type: integer
 *             visioConference:
 *               type: integer
 *             questionnaire:
 *               type: integer
 *         avgProcessusDuree:
 *           type: number
 *         postulationsBySource:
 *           type: object
 *           properties:
 *             linkedin:
 *               type: integer
 *             indeed:
 *               type: integer
 *             jooble:
 *               type: integer
 *             francetravail:
 *               type: integer
 *             messager:
 *               type: integer
 *             whatsapp:
 *               type: integer
 *             instagram:
 *               type: integer
 *             telegram:
 *               type: integer
 *             twitter:
 *               type: integer
 *             quebecSite:
 *               type: integer
 *         totalInvitations:
 *           type: integer
 *         pendingInvitations:
 *           type: integer
 *         totalPostCarriere:
 *           type: integer
 *       example:
 *         id: 1
 *         name: "Tech Corp"
 *         totalUsers: 10
 *         totalModerators: 8
 *         totalAdmins: 2
 *         totalActiveUsers: 9
 *         totalVerifiedUsers: 7
 *         totalOffres: 5
 *         top3OffresByPostulations:
 *           - { id: 1, titre: "Dev Senior", postulationCount: 20 }
 *           - { id: 2, titre: "Designer", postulationCount: 15 }
 *           - { id: 3, titre: "Manager", postulationCount: 10 }
 *         last3Offres:
 *           - { id: 5, titre: "Stagiaire", createdAt: "2025-03-28T10:00:00Z" }
 *           - { id: 4, titre: "Dev Junior", createdAt: "2025-03-27T15:00:00Z" }
 *           - { id: 3, titre: "Manager", createdAt: "2025-03-26T09:00:00Z" }
 *         totalPostulations: 50
 *         minPostulationsPerOffer: 5
 *         maxPostulationsPerOffer: 20
 *         avgPostulationsPerOffer: 10.0
 *         avgSalary: 45000.50
 *         totalProcessus: 8
 *         processusByType: { tache: 3, visioConference: 2, questionnaire: 3 }
 *         avgProcessusDuree: 45.5
 *         postulationsBySource:
 *           linkedin: 30
 *           indeed: 10
 *           jooble: 5
 *           francetravail: 2
 *           messager: 1
 *           whatsapp: 1
 *           instagram: 0
 *           telegram: 0
 *           twitter: 0
 *           quebecSite: 1
 *         totalInvitations: 15
 *         pendingInvitations: 5
 *         totalPostCarriere: 3
 */

/**
 * @swagger
 * /api/organisations/{id}/dashboard:
 *   get:
 *     summary: Récupérer les statistiques complètes d'une organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'organisation
 *     responses:
 *       '200':
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganisationDashboardResponse'
 *       '400':
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID d'organisation invalide"
 *       '404':
 *         description: Organisation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Organisation non trouvée"
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur lors de la récupération des statistiques"
 */
router.get("/:id/dashboard", IsAuthenticated, organisationController.getOrganisationDashboard);

module.exports = router;
