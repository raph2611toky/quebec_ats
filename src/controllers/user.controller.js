require("dotenv").config();
const User = require("../models/user.model");
const { generateToken, verifyToken } = require("../utils/securite/jwt");
const { encryptAES, decryptAES } = require("../utils/securite/cryptographie");
const cloudinary = require("../config/cloudinary.config");
const fs = require("fs").promises;
const { uploadDefaultProfileImage, deleteImageFromCloudinary } = require("../utils/cloudinary.utils");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendEmail, existingType } = require("../services/notifications/email");

const generateInvitationToken = () => {
  return generateToken({ type: "invitation" }, "24h");
};
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
        } else {
            profileUrl = await uploadDefaultProfileImage();
        }

        const adminData = {
            ...req.body,
            profile: profileUrl,
            is_active: false,
            role: "ADMINISTRATEUR",
            organisations: req.body.organisations
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

        return res.status(201).json({ email: newAdmin.email, message: "Vérifiez votre email pour l'OTP" });
    } catch (error) {
        console.error("Erreur lors de la création de l'administrateur:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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

        await User.update(user.id, { is_verified: true });
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
        const token = generateToken({ id: user.id, role: encryptAES(user.role) });

        return res.status(200).json({ email: user.email, token });
    } catch (error) {
        console.error("Erreur lors de la confirmation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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

        return res.status(200).json({ email: user.email, message: "Un nouvel OTP a été envoyé à votre email" });
    } catch (error) {
        console.error("Erreur lors du renvoi de l'OTP:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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

        return res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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

        return res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user || !(await User.comparePassword(password, user.password)) || !user.is_verified) {
            return res.status(401).json({ error: "Identifiants invalides ou compte non activé" });
        }
        const token = generateToken({ id: user.id, role: encryptAES(user.role) });
        await User.update(user.id, { is_active: true });
        return res.status(200).json({ name: user.name, token });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        const user = await User.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Profil non trouvé" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
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
        } else if (!existingUser.profile) {
            updateData.profile = await uploadDefaultProfileImage();
        }

        if (updateData.organisations) {
            updateData.organisations = Array.isArray(updateData.organisations)
                ? updateData.organisations.map(id => parseInt(id))
                : [parseInt(updateData.organisations)];
        }

        const updatedUser = await User.update(req.user.id, updateData);
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.logout = async (req, res) => {
    try {
        await User.update(req.user.id, { is_active: false });
        return res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.sendInvitation = async (req, res) => {
    try {
        const { invitee_email, organisation_id, role } = req.body;
        const inviter_id = req.user.id;
    
        const inviter = await User.getById(inviter_id)
        if (!inviter || inviter.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent inviter" });
        }
    
        let validatedOrganisationId = null;
        if (role === "MODERATEUR") {
            if (!organisation_id) {
            return res.status(400).json({ error: "L'organisation est requise pour un modérateur" });
            }
            const organisation = await prisma.organisation.findUnique({
            where: { id: organisation_id },
            });
            if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
            }
            validatedOrganisationId = organisation_id;
        } else if (role === "ADMINISTRATEUR") {
            if (organisation_id) {
            return res.status(400).json({ error: "L'organisation ne doit pas être spécifiée pour un administrateur" });
            }
        } else {
            return res.status(400).json({ error: "Rôle invalide" });
        }
    
        const existingUser = await prisma.user.findUnique({
            where: { email: invitee_email },
        });
    
        const token = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
        const invitation = await prisma.queueInvitationOrganisation.create({
            data: {
            inviter_id,
            invitee_email,
            organisation_id: validatedOrganisationId,
            role: role || "MODERATEUR",
            token,
            expires_at: expiresAt,
            },
        });
    
        const baseUrl = process.env.FRONTEND_URL_DEV;
        let invitationLink;
        let emailType;
        let emailData;
    
        if (existingUser) {
            invitationLink = `${baseUrl}/organisation/invite?token=${token}`;
            emailType = existingType.existingUserInvitation;
            emailData = {
                inviteeName: existingUser.name || invitee_email,
                organisationName: role === "MODERATEUR" ? (await prisma.organisation.findUnique({ where: { id: validatedOrganisationId } })).nom : "toutes les organisations",
                inviterName: inviter.name,
                invitationLink,
                role,
            };
        } else {
            invitationLink = `${baseUrl}/organisation/invite/add?token=${token}`;
            emailType = existingType.newUserInvitation;
            emailData = {
                inviteeEmail: invitee_email,
                organisationName: role === "MODERATEUR" ? (await prisma.organisation.findUnique({ where: { id: validatedOrganisationId } })).nom : "toutes les organisations",
                inviterName: inviter.name,
                invitationLink,
                role,
            };
        }
    
        await sendEmail({
            to: invitee_email,
            subject: `Invitation à rejoindre ${emailData.organisationName}`,
            type: emailType,
            data: emailData,
        });
    
        return res.status(201).json({ message: "Invitation envoyée avec succès" });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.confirmInvitation = async (req, res) => {
    try {
      const { token, email } = req.body;
  
      const invitation = await prisma.queueInvitationOrganisation.findUnique({
        where: { token },
        include: { organisation: true },
      });
  
      if (!invitation || new Date() > invitation.expires_at) {
        return res.status(400).json({ error: "Lien d'invitation invalide ou expiré" });
      }
      if (invitation.invitee_email !== email) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à accepter cette invitation" });
      }
  
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
  
      let updateData;
      if (invitation.role === "MODERATEUR") {
        updateData = {
          organisations: {
            connect: { id: invitation.organisation_id },
          },
        };
      } else if (invitation.role === "ADMINISTRATEUR") {
        const allOrganisations = await prisma.organisation.findMany();
        updateData = {
          role: "ADMINISTRATEUR",
          organisations: {
            connect: allOrganisations.map(org => ({ id: org.id })),
          },
        };
      }
  
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
  
      await prisma.queueInvitationOrganisation.delete({
        where: { id: invitation.id },
      });
  
      const orgName = invitation.role === "MODERATEUR" ? invitation.organisation.nom : "toutes les organisations";
      return res.status(200).json({ message: `Vous avez rejoint ${orgName} en tant que ${invitation.role}` });
    } catch (error) {
      console.error("Erreur lors de la confirmation de l'invitation:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.acceptInvitation = async (req, res) => {
    try {
      const { token, name, password, phone } = req.body;
  
      const invitation = await prisma.queueInvitationOrganisation.findUnique({
        where: { token },
        include: { organisation: true },
      });
  
      if (!invitation || new Date() > invitation.expires_at) {
        return res.status(400).json({ error: "Lien d'invitation invalide ou expiré" });
      }
  
      let organisationConnect;
      if (invitation.role === "MODERATEUR") {
        organisationConnect = { connect: { id: invitation.organisation_id } };
      } else if (invitation.role === "ADMINISTRATEUR") {
        const allOrganisations = await prisma.organisation.findMany();
        organisationConnect = { connect: allOrganisations.map(org => ({ id: org.id })) };
      }
  
      const newUser = await prisma.user.create({
        data: {
          email: invitation.invitee_email,
          name,
          password,
          phone,
          role: invitation.role,
          is_active: true,
          is_verified: true,
          organisations: organisationConnect,
        },
      });
  
      await prisma.queueInvitationOrganisation.delete({
        where: { id: invitation.id },
      });
  
      const orgName = invitation.role === "MODERATEUR" ? invitation.organisation.nom : "toutes les organisations";
      const authToken = generateToken({ id: newUser.id , role: encryptAES(invitation.role)});
      return res.status(201).json({
        message: `Compte créé et vous avez rejoint ${orgName} en tant que ${invitation.role}`,
        token: authToken,
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.removeFromOrganisation = async (req, res) => {
    try {
        const { user_id, organisation_id } = req.body;
        const admin_id = req.user.id;
    
        const admin = await prisma.user.findUnique({
            where: { id: admin_id },
        });
        if (!admin || admin.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent retirer des utilisateurs" });
        }
    
        const user = await prisma.user.findUnique({
            where: { id: user_id },
            include: { organisations: true },
        });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
    
        if (user_id === admin_id) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous retirer vous-même" });
        }
    
        let updatedOrganisations;
        if (user.role === "MODERATEUR") {
            if (!organisation_id) {
            return res.status(400).json({ error: "L'ID de l'organisation est requis pour un modérateur" });
            }
            const organisation = await prisma.organisation.findUnique({
            where: { id: organisation_id },
            });
            if (!organisation) {
            return res.status(404).json({ error: "Organisation non trouvée" });
            }
    
            const isInOrganisation = user.organisations.some(org => org.id === organisation_id);
            if (!isInOrganisation) {
            return res.status(400).json({ error: "L'utilisateur n'appartient pas à cette organisation" });
            }
    
            updatedOrganisations = {
            disconnect: { id: organisation_id },
            };
        } else if (user.role === "ADMINISTRATEUR") {
            return res.status(400).json({ error: "Un administrateur ne peut pas etre detaché d'une organisation." });
        }
    
        await prisma.user.update({
            where: { id: user_id },
            data: {
            organisations: updatedOrganisations,
            },
        });
    
        const message = user.role === "MODERATEUR"
            ? `L'utilisateur a été retiré de l'organisation ${organisation_id}`
            : "L'utilisateur a été retiré de toutes les organisations";
        
        return res.status(200).json({ message });
    } catch (error) {
      console.error("Erreur lors du retrait de l'utilisateur de l'organisation:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
  };

  exports.listInvitationQueue = async (req, res) => {
    try {
        const admin_id = req.user.id;
    
        const admin = await prisma.user.findUnique({
            where: { id: admin_id },
        });
        if (!admin || admin.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent voir la liste des invitations" });
        }
    
        const invitations = await prisma.queueInvitationOrganisation.findMany({
            where: {
            expires_at: { gt: new Date() }
            },
            include: {
            inviter: {
                select: { id: true, name: true, email: true },
            },
            organisation: {
                select: { id: true, nom: true },
            },
            },
            orderBy: { created_at: "desc" },
        });
    
        return res.status(200).json(invitations);
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste des invitations:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
  
exports.cancelInvitation = async (req, res) => {
    try {
        const invitation_id = parseInt(req.params.invitation_id);
        const admin_id = req.user.id;
    
        const admin = await prisma.user.findUnique({
            where: { id: admin_id },
        });
        if (!admin || admin.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent annuler des invitations" });
        }
    
        const invitation = await prisma.queueInvitationOrganisation.findUnique({
            where: { id: parseInt(invitation_id) },
            include: { organisation: true },
        });
        if (!invitation) {
            return res.status(404).json({ error: "Invitation non trouvée" });
        }
        if (new Date() > invitation.expires_at) {
            return res.status(400).json({ error: "L'invitation est déjà expirée" });
        }
    
        await prisma.queueInvitationOrganisation.delete({
            where: { id: invitation_id },
        });
    
        const orgName = invitation.role === "MODERATEUR" && invitation.organisation
            ? invitation.organisation.nom
            : "toutes les organisations";
        return res.status(200).json({
            message: `L'invitation pour ${invitation.invitee_email} à rejoindre ${orgName} a été annulée`,
        });
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'invitation:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = exports;