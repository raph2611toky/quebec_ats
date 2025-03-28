require("dotenv").config()
const User = require("../models/user.model");
const { generateToken, verifyToken } = require("../utils/securite/jwt");
const { encryptAES, decryptAES } = require("../utils/securite/cryptographie")
const cloudinary = require("../config/cloudinary.config");
const fs = require("fs").promises;
const { uploadDefaultProfileImage, deleteImageFromCloudinary } = require("../utils/cloudinary.utils");
const { sendEmail } = require("../services/notifications/email");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateOtp = () => Math.floor(10000000 + Math.random() * 90000000).toString();

exports.registerAdmin = async (req, res) => {
    try {
        const user = await User.findByEmail(req.body.email);
        if (user) {
            return res.status(401).json({ error: "Cet administrateur s'est déjà enregistré" });
        }

        let profileUrl;
        if (req.file) {
            try {
                await fs.access(req.file.path);
            } catch (error) {
                console.error("Le fichier n'a pas été correctement transféré:", error);
                return res.status(400).json({ error: "Erreur lors du transfert de l'image" });
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "admin_profiles",
                use_filename: true,
                unique_filename: false
            });
            profileUrl = result.secure_url;
            // await fs.unlink(req.file.path);
        } else {
            profileUrl = await uploadDefaultProfileImage();
        }

        const adminData = {
            ...req.body,
            profile: profileUrl,
            is_active: false
        };
        const newAdmin = await User.create(adminData);

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.otpVerification.create({
            data: {
                user_id: newAdmin.id,
                otp,
                expires_at: expiresAt
            }
        });

        await sendEmail({
            to: newAdmin.email,
            subject: "Validation de votre inscription",
            type: "otpValidation",
            data: { otp }
        });

        res.status(201).json({ email: newAdmin.email, message: "Vérifiez votre email pour l'OTP" });
    } catch (error) {
        console.error("Erreur lors de la création de l'administrateur:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.confirmRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const otpRecord = await prisma.otpVerification.findFirst({
            where: { user_id: user.id, otp }
        });

        if (!otpRecord || new Date() > otpRecord.expires_at) {
            return res.status(400).json({ error: "OTP invalide ou expiré" });
        }

        await User.update(user.id, { is_active: true });
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
        const token = generateToken({ id: user.id });

        res.status(200).json({ email: user.email, token });
    } catch (error) {
        console.error("Erreur lors de la confirmation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (user.is_active) {
            return res.status(400).json({ error: "Cet utilisateur est déjà activé" });
        }

        await prisma.otpVerification.deleteMany({
            where: { user_id: user.id }
        });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otpVerification.create({
            data: {
                user_id: user.id,
                otp,
                expires_at: expiresAt
            }
        });

        await sendEmail({
            to: user.email,
            subject: "Renvoi de votre code OTP",
            type: "otpValidation",
            data: { otp }
        });

        res.status(200).json({ email: user.email, message: "Un nouvel OTP a été envoyé à votre email" });
    } catch (error) {
        console.error("Erreur lors du renvoi de l'OTP:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        const token = generateToken({ id: user.id, otp }, "1h");

        await prisma.otpVerification.deleteMany({ where: { user_id: user.id } });
        await prisma.otpVerification.create({
            data: {
                user_id: user.id,
                otp,
                expires_at: expiresAt
            }
        });

        const encryptedToken = encryptAES(token);
        const resetLink = `${process.env.FRONTEND_URL}/security/password/reset?verification=${encodeURIComponent(encryptedToken)}`;

        await sendEmail({
            to: user.email,
            subject: "Réinitialisation de mot de passe",
            type: "forgotPassword",
            data: { resetLink }
        });

        res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { encryptedToken, newPassword } = req.body;
        let token;
        try {
            token = decryptAES(decodeURIComponent(encryptedToken));
        } catch (error) {            
            return res.status(400).json({ error: "Lien de réinitialisation invalide" });
        }
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(400).json({ error: "Lien de réinitialisation expiré ou invalide" });
        }
        const user = await User.getById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        const otpRecord = await prisma.otpVerification.findFirst({
            where: { user_id: user.id, otp: decoded.otp }
        });

        if (!otpRecord || new Date() > otpRecord.expires_at) {
            return res.status(400).json({ error: "OTP invalide ou expiré" });
        }
        if (otpRecord.otp !== decoded.otp) {
            return res.status(400).json({ error: "OTP incorrect" });
        }

        await User.update(user.id, { password: newPassword });

        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user || !(await User.comparePassword(password, user.password)) || !user.is_active) {
            return res.status(401).json({ error: "Identifiants invalides ou compte non activé" });
        }

        const token = generateToken({ id: user.id });
        res.status(200).json({ name: user.name, token });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        const user = await User.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Profil non trouvé" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        let updateData = { ...req.body };
        const existingUser = await User.getById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (req.file) {
            try {
                await fs.access(req.file.path);
            } catch (error) {
                console.error("Le fichier n'a pas été correctement transféré:", error);
                return res.status(400).json({ error: "Erreur lors du transfert de l'image" });
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "admin_profiles",
                use_filename: true,
                unique_filename: false
            });

            if (!result.secure_url) {
                throw new Error("Échec de l'upload sur Cloudinary");
            }

            if (existingUser.profile && !existingUser.profile.includes("default_profile")) {
                await deleteImageFromCloudinary(existingUser.profile);
            }

            updateData.profile = result.secure_url;
            // await fs.unlink(req.file.path);
        } else if (!existingUser.profile) {
            updateData.profile = await uploadDefaultProfileImage();
        }

        const updatedUser = await User.update(req.user.id, updateData);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.logout = async (req, res) => {
    try {
        await User.update(req.user.id, { is_active: false });
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};