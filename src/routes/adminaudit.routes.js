const express = require("express");
const router = express.Router();
const adminAuditController = require("../controllers/adminaudit.controller");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdminAudit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de l'audit
 *           example: 1
 *         admin_id:
 *           type: integer
 *           description: Identifiant de l'administrateur ayant effectué l'action
 *           example: 42
 *         action:
 *           type: string
 *           description: Type d'action réalisée par l'administrateur (ex. suppression_offre, modification_organisation)
 *           example: "modification_offre"
 *         label:
 *           type: string
 *           description: Description textuelle de l'action effectuée
 *           example: "Jean Dupont a modifié l'offre intitulée 'Développeur Full Stack' dans l'organisation 'TechCorp'"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date et heure de création de l'audit
 *           example: "2025-04-06T10:30:00Z"
 *       required:
 *         - admin_id
 *         - action
 *         - label
 */

/**
 * @swagger
 * tags:
 *   - name: AdminAudit
 *     description: |
 *       **Gestion des audits administratifs**  
 *       Ce module permet de gérer les enregistrements des actions effectuées par les administrateurs dans le système.  
 *       
 *       ### Fonctionnalités :
 *       - **Récupération des audits (individuel ou liste complète)**  
 *       - **Mise à jour des informations d'un audit existant**  
 *       - **Suppression d'un audit spécifique**  
 *       
 *       ### Pré-requis : 
 *       - **Compte avec rôle Administrateur requis pour toutes les actions**  
 *       - **Authentification via JWT (JSON Web Token)** pour accéder aux endpoints  
 *       
 *       ### Fonctionnement : 
 *       - **Audit - Les enregistrements sont générés automatiquement lors d'actions critiques (ex. modification d'une offre, suppression d'une organisation)**  
 *       - **Audit - Les administrateurs peuvent consulter l'historique des actions pour un suivi ou une vérification (individuellement par ID ou en liste complète)**  
 *       - **Audit - La mise à jour permet de corriger des informations erronées dans un enregistrement (ex. changement d'action ou de description)**  
 *       - **Audit - La suppression est disponible pour nettoyer les enregistrements obsolètes ou inutiles, avec restriction aux administrateurs uniquement**  
 */

/**
 * @swagger
 * /api/admin-audits/{id}:
 *   get:
 *     summary: Récupérer un audit par ID
 *     tags: [AdminAudit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'audit
 *     responses:
 *       200:
 *         description: Audit récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminAudit'
 *       404:
 *         description: Audit non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get(
    "/:id",
    IsAuthenticated,
    IsAuthenticatedAdmin,
    adminAuditController.getAdminAuditById
);

/**
 * @swagger
 * /api/admin-audits:
 *   get:
 *     summary: Récupérer tous les audits
 *     tags: [AdminAudit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des audits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminAudit'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get(
    "/",
    IsAuthenticated,
    IsAuthenticatedAdmin,
    adminAuditController.getAllAdminAudits
);


/**
 * @swagger
 * /api/admin-audits/{id}:
 *   put:
 *     summary: Mettre à jour un audit
 *     tags: [AdminAudit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'audit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_id:
 *                 type: integer
 *               action:
 *                 type: string
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audit mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminAudit'
 *       404:
 *         description: Audit non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put(
    "/:id",
    IsAuthenticated,
    IsAuthenticatedAdmin,
    adminAuditController.updateAdminAudit
);


/**
 * @swagger
 * /api/admin-audits/{id}:
 *   delete:
 *     summary: Supprimer un audit
 *     tags: [AdminAudit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'audit
 *     responses:
 *       200:
 *         description: Audit supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Audit non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete(
    "/:id",
    IsAuthenticated,
    IsAuthenticatedAdmin,
    adminAuditController.deleteAdminAudit
);

module.exports = router;