const express = require("express");
const router = express.Router();
const { 
    registerAdmin, 
    loginAdmin, 
    getAdminProfile, 
    updateAdminProfile,
    logout,
    getAllUsers, confirmRegistration, forgotPassword, resetPassword,
    resendOtp
} = require("../controllers/user.controller");
const { createUserValidationRules, updateUserValidationRules } = require("../validators/user.validator");
const validateHandler = require("../middlewares/error.handler");
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../middlewares/auth.middleware");
const createUpload = require("../config/multer.config");

const upload = createUpload("users");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: | 
 *       Gestion des utilisateurs
 *       ### Fonctionnalités :
 *       -  **Register, Login , otp, suppression et gestion des users et candidats**
 *       
 *       ### Pré-requis : 
 *       -  **Compte Admin et non admin pour effectuer actions** 
 *       
 *       ### Fonctionnement : 
 *       -  **User et admin simple fait register**
 *       -  **Candidat - Au moment de postuler à une offre, on créé un compte pour le candidat si mail fournie pas compte existant**
 *       -  **Referant - Après avoir postuler à une offre, on propose au candidat de référé quelqu'un pour ajouté à sont postulation et utilisé dans autre futur postulation, visible pour admin**
 *       -  **Referant - Une fois le demand envoyé, le référant reçoit mail pour confirmé le référencement en ajoutant son note personnelle. ** 
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'utilisateur
 *         name:
 *           type: string
 *           description: Nom complet de l'utilisateur
 *         email:
 *           type: string
 *           description: Adresse email
 *         password:
 *           type: string
 *           description: Mot de passe
 *         phone:
 *           type: string
 *           description: Numéro de téléphone
 *         profile:
 *           type: string
 *           description: URL de l'image de profil
 *         role:
 *           type: string
 *           enum: [MODERATEUR, ADMINISTRATEUR]
 *           description: Rôle de l'utilisateur
 *         is_active:
 *           type: boolean
 *           description: Statut d'activité de l'utilisateur
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
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: hashed_password
 *         phone: "+261341234567"
 *         profile: "https://res.cloudinary.com/example/image/upload/v1234567890/user_profiles/profile.jpg"
 *         role: MODERATEUR
 *         is_active: true
 *         created_at: "2025-03-18T10:00:00Z"
 *         updated_at: "2025-03-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès interdit (non administrateur)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès interdit : vous n'êtes pas administrateur."
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
router.get("/", IsAuthenticated, IsAuthenticatedAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Profil non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Profil non trouvé"
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
router.get("/me", IsAuthenticated, getAdminProfile);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Inscription d'un administrateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *               role:
 *                 type: string
 *                 enum: [MODERATEUR, ADMINISTRATEUR] 
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - role
 *     responses:
 *       201:
 *         description: Administrateur créé, OTP envoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/register", upload.single("profile"), registerAdmin);

/**
 * @swagger
 * /api/users/confirm:
 *   post:
 *     summary: Confirmer l'inscription avec OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: Inscription confirmée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: OTP invalide ou expiré
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/confirm", confirmRegistration);

/**
 * @swagger
 * /api/users/resend-otp:
 *   post:
 *     summary: Demander le renvoi d'un OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email de l'utilisateur demandant un nouvel OTP
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Nouvel OTP envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 message:
 *                   type: string
 *                   example: "Un nouvel OTP a été envoyé à votre email"
 *       400:
 *         description: Utilisateur déjà activé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cet utilisateur est déjà activé"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
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
router.post("/resend-otp", resendOtp);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encryptedToken:
 *                 type: string
 *                 description: Token chiffré reçu dans l'email
 *                 example: "encryptedStringHere"
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe
 *                 example: "NewPass123!"
 *             required:
 *               - encryptedToken
 *               - newPassword
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mot de passe réinitialisé avec succès"
 *       400:
 *         description: Erreur de validation (token ou OTP invalide/expiré)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "OTP invalide ou expiré"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
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
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion de l'utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "Password@123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 role:
 *                   type: string
 *                   example: "MODERATEUR"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOi..."
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Identifiants invalides"
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
router.post("/login", loginAdmin);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom
 *                 example: "Updated John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nouvel email
 *                 example: "updated.john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: Nouveau mot de passe
 *                 example: "NewPassword@123"
 *               phone:
 *                 type: string
 *                 description: Nouveau numéro de téléphone
 *                 example: "+261341234567"
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: Nouvelle image de profil (optionnel)
 *               role:
 *                 type: string
 *                 enum: [MODERATEUR, ADMINISTRATEUR]
 *                 description: Nouveau rôle (optionnel)
 *                 example: "ADMINISTRATEUR"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
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
router.put("/me", IsAuthenticated, upload.single("profile"), updateUserValidationRules, validateHandler, updateAdminProfile);

/**
 * @swagger
 * /api/users/logout:
 *   put:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
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
router.put("/logout", IsAuthenticated, logout);

module.exports = router;