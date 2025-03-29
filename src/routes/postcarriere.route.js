const express = require("express");
const router = express.Router();
const postCarriereController = require("../controllers/postcarriere.controller");
const createUpload = require("../config/multer.config");

const upload = createUpload("postcarriere");

/**
 * @swagger
 * tags:
 *   name: PostCarriere
 *   description: Gestion des posts de carrière
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostCarriere:
 *       type: object
 *       required:
 *         - titre
 *         - contenu
 *         - organisation_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du post carrière
 *         titre:
 *           type: string
 *           description: Titre du post carrière
 *         contenu:
 *           type: string
 *           description: Contenu du post carrière
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs des images associées
 *         organisation_id:
 *           type: integer
 *           description: ID de l'organisation associée
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
 *         titre: "Nouveau poste de développeur"
 *         contenu: "Nous recherchons un développeur talentueux..."
 *         images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         organisation_id: 3
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/postcarieres:
 *   post:
 *     summary: Créer un post carrière avec upload d'images
 *     tags: [PostCarriere]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               contenu:
 *                 type: string
 *               organisation_id:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - titre
 *               - contenu
 *               - organisation_id
 *     responses:
 *       201:
 *         description: Post carrière créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostCarriere'
 *       400:
 *         description: Erreur lors de la création du post carrière
 */
router.post("/", upload.array("images", 5), postCarriereController.createPostCarriere);

/**
 * @swagger
 * /api/postcarieres/{id}:
 *   put:
 *     summary: Modifier un post carrière existant avec upload d'images
 *     tags: [PostCarriere]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du post carrière à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               contenu:
 *                 type: string
 *               organisation_id:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post carrière mis à jour avec succès
 *       404:
 *         description: Post carrière non trouvé
 */
router.put("/:id", upload.array("images", 5), postCarriereController.updatePostCarriere);

/**
 * @swagger
 * /api/postcarieres/{id}:
 *   delete:
 *     summary: Supprimer un post carrière
 *     tags: [PostCarriere]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du post carrière à supprimer
 *     responses:
 *       200:
 *         description: Post carrière supprimé avec succès
 *       404:
 *         description: Post carrière non trouvé
 */
router.delete("/:id", postCarriereController.deletePostCarriere);

/**
 * @swagger
 * /api/postcarieres/{id}:
 *   get:
 *     summary: Récupérer un post carrière par ID
 *     tags: [PostCarriere]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du post carrière
 *     responses:
 *       200:
 *         description: Détails du post carrière
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostCarriere'
 *       404:
 *         description: Post carrière non trouvé
 */
router.get("/:id", postCarriereController.getPostCarriereById);

/**
 * @swagger
 * /api/postcarieres:
 *   get:
 *     summary: Récupérer tous les posts carrière
 *     tags: [PostCarriere]
 *     responses:
 *       200:
 *         description: Liste des posts carrière
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostCarriere'
 */
router.get("/", postCarriereController.getAllPostCarieres);

/**
 * @swagger
 * /api/postcarieres/organisation/{organisationId}:
 *   get:
 *     summary: Récupérer les posts carrière d'une organisation
 *     tags: [PostCarriere]
 *     parameters:
 *       - in: path
 *         name: organisationId
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
router.get("/organisation/:organisationId", postCarriereController.getPostCarieresByOrganisation);

module.exports = router;
