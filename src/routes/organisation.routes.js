const express = require("express");
const router = express.Router();
const organisationController = require("../controllers/organisation.controller");

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Gestion des organisations
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organisation'
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
router.post("/", organisationController.createOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   put:
 *     summary: Modifier une organisation existante
 *     tags: [Organisations]
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
router.put("/:id", organisationController.updateOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   delete:
 *     summary: Supprimer une organisation
 *     tags: [Organisations]
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
router.delete("/:id", organisationController.deleteOrganisation);

/**
 * @swagger
 * /api/organisations/{id}:
 *   get:
 *     summary: Récupérer une organisation par ID
 *     tags: [Organisations]
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
router.get("/:id", organisationController.getOrganisation);

/**
 * @swagger
 * /api/organisations:
 *   get:
 *     summary: Récupérer toutes les organisations
 *     tags: [Organisations]
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
router.get("/", organisationController.getAllOrganisations);

/**
 * @swagger
 * /api/organisations/{id}/offres:
 *   get:
 *     summary: Récupérer les offres d'une organisation
 *     tags: [Organisations]
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
router.get("/:id/offres", organisationController.getOffresByOrganisation);

/**
 * @swagger
 * /api/organisations/{id}/postcarieres:
 *   get:
 *     summary: Récupérer les posts carrière d'une organisation
 *     tags: [Organisations]
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
router.get("/:id/postcarieres", organisationController.getPostCarieresByOrganisation);

module.exports = router;
