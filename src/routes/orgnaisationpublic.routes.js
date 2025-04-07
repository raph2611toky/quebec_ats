const express = require("express");
const router = express.Router();
const organisationController = require("../controllers/organisation.controller");
const { IsAuthenticatedAdmin, IsAuthenticated } = require("../middlewares/auth.middleware")



/**
 * @swagger
 * /api/organisations-all:
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 6
 *                   nom:
 *                     type: string
 *                     example: "Centre de services scolaire de la Pointe-de-l'Île"
 *                   adresse:
 *                     type: string
 *                     example: "550 53e Avenue, Montréal, Québec, Canada, H1A 2T7"
 *                   ville:
 *                     type: string
 *                     example: "514-642-9520"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-07T04:29:36.703Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-07T04:29:36.703Z"
 */
router.get("/", organisationController.getAllOrganisationsPublic);


/**
 * @swagger
 * /api/organisations-all/{id}/offres:
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
router.get("/:id/offres", organisationController.getOffresByOrganisationPublic);


module.exports = router;
