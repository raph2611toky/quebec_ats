const express = require("express");
const router = express.Router();
const postCarriereController = require("../controllers/postcarriere.controller");
const createUpload = require("../config/multer.config");

const upload = createUpload("postcarriere");

/**
 * @swagger
 * tags:
 *   name: PostCarriere
 *   description: |
 *       Gestion des posts de carrière
 *       
 *       ### Fonctionnalités :
 *       - **Création, modification et suppression de posts de carrière**
 *       - **Ajout et gestion des images associées aux posts**
 *       - **Consultation de tous les posts ou d’un post spécifique**
 *       
 *       ### Pré-requis :
 *       - **Compte utilisateur avec les permissions requises pour créer ou modifier un post**
 *       
 *       ### Fonctionnement :
 *       - **Un post de carrière appartient à une organisation spécifique.**
 *       - **Lors de la création ou modification d’un post, on peut joindre plusieurs images.**
 *       - **Les utilisateurs peuvent consulter la liste des posts disponibles.**
 *       - **Un post peut être supprimé définitivement par un administrateur.**
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
 * /api/postcarrieres:
 *   post:
 *     summary: Créer un post carrière avec upload d'images
 *     tags: [PostCarriere]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre du post carrière
 *                 example: "Recrutement Développeur Full Stack"
 *               contenu:
 *                 type: string
 *                 description: Contenu du post carrière
 *                 example: "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe."
 *               organisation_id:
 *                 type: integer
 *                 description: ID de l'organisation
 *                 example: 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des URL des images sur AWS
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
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
router.post("/", postCarriereController.createPostCarriere);

/**
 * @swagger
 * /api/postcarrieres/{id}:
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Nouveau titre du post carrière
 *                 example: "Recrutement Développeur Senior"
 *               contenu:
 *                 type: string
 *                 description: Nouveau contenu du post carrière
 *                 example: "Nous recherchons un développeur senior pour un poste clé."
 *               organisation_id:
 *                 type: integer
 *                 description: ID de l'organisation
 *                 example: 2
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des URL des images sur AWS
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *     responses:
 *       200:
 *         description: Post carrière mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostCarriere'
 *       404:
 *         description: Post carrière non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Post carrière non trouvé"
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
router.put("/:id", postCarriereController.updatePostCarriere);

/**
 * @swagger
 * /api/postcarrieres/{id}:
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
 * /api/postcarrieres/{id}:
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
router.get("/:id", postCarriereController.getPostCarriere);

/**
 * @swagger
 * /api/postcarrieres:
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

module.exports = router;
