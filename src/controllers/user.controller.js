const User = require("../models/user.model");
const { generateToken } = require("../utils/securite/jwt");
const cloudinary = require("../config/cloudinary.config");
const fs = require("fs").promises;
const { uploadDefaultProfileImage, deleteImageFromCloudinary } = require("../utils/cloudinary.utils");

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
            await fs.unlink(req.file.path);
        } else {
            profileUrl = await uploadDefaultProfileImage();
        }

        const adminData = {
            ...req.body,
            profile: profileUrl
        };
        const newAdmin = await User.create(adminData);
        const token = generateToken({ id: newAdmin.id });

        res.status(201).json({ email: newAdmin.email, token });
    } catch (error) {
        console.error("Erreur lors de la création de l'administrateur:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user || !(await User.comparePassword(password, user.password))) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        await User.update(user.id, { is_active: true });
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
            await fs.unlink(req.file.path);
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