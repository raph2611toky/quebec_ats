require("dotenv").config();
const User = require("../models/user.model");

const { generateToken, verifyToken } = require("../utils/securite/jwt");
const bcrypt = require("../utils/securite/bcrypt");
const { encryptAES, decryptAES } = require("../utils/securite/cryptographie");
const cloudinary = require("../config/cloudinary.config");
const { Role } = require("@prisma/client")
const fs = require("fs").promises;
const { uploadDefaultProfileImage, deleteImageFromCloudinary } = require("../utils/cloudinary.utils");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
const prisma = require("../config/prisma.config");
const { sendEmail, existingType } = require("../services/notifications/email");
const createGoogleMeet = require("../services/meet/googleMeet.services")

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

        const allOrganisations = await prisma.organisation.findMany({
            select: { id: true }
        });

        const adminData = {
            ...req.body,
            profile: profileUrl,
            is_active: false,
            role: Role.ADMINISTRATEUR,
            organisations: {
                connect: allOrganisations.map(org => ({ id: org.id }))
            }
        };

        const newAdmin = await prisma.user.create({
            data: adminData
        });

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
        //const user = await User.findByEmail(email);

        const user = await prisma.user.findUnique({
            where: { email }
        });
        
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

exports.getAdminProfileMe = async (req, res) => {
    try {
        const user = await User.getById(parseInt(req.user.id), details=true);
        if (!user) {
            return res.status(404).json({ error: "Profil non trouvé" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        const user = await User.getById(parseInt(req.params.id), details=true);
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
        const user = req.user;
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

        if(updateData.role && updateData.role !== user.role){
            return res.status(403).json({"erreur":"Vous ne pouvez pas "});
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
        let { invitee_email, organisation_id, role } = req.body;
        const inviter_id = req.user.id;
    
        const inviter = await prisma.user.findUnique({
            where: {
                id: inviter_id
            },
            include: {
                organisations: true
            }
        })
        const inviter_organisation_ids = inviter.organisations.map(org => org.id)
        if (!inviter || inviter.role !== Role.ADMINISTRATEUR) {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent inviter" });
        }    
        let validatedOrganisationId = null;
        role = inviter.role === Role.MODERATEUR ? Role.MODERATEUR : role
        if (role === Role.MODERATEUR) {
            if (!organisation_id) {
                return res.status(400).json({ error: "L'organisation est requise pour un modérateur" });
            }            
            if ( ! inviter_organisation_ids.includes(organisation_id)){
                return res.status(401).json({"erreur":"Vous n'avez de droit d'accès à cette organisation"})
            }
            const organisation = await prisma.organisation.findUnique({
            where: { id: organisation_id },
            });
            if (!organisation) {
                return res.status(404).json({ error: "Organisation non trouvée" });
            }
            validatedOrganisationId = organisation_id;
        } else if (role === Role.ADMINISTRATEUR) {
            // if (organisation_id) {
            //     return res.status(400).json({ error: "L'organisation ne doit pas être spécifiée pour un administrateur" });
            // }
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
            role: role || Role.MODERATEUR,
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
                organisationName: role === Role.MODERATEUR ? (await prisma.organisation.findUnique({ where: { id: validatedOrganisationId } })).nom : "toutes les organisations",
                inviterName: inviter.name,
                invitationLink,
                role,
            };
        } else {
            invitationLink = `${baseUrl}/organisation/invite/add?token=${token}`;
            emailType = existingType.newUserInvitation;
            emailData = {
                inviteeEmail: invitee_email,
                organisationName: role === Role.MODERATEUR ? (await prisma.organisation.findUnique({ where: { id: validatedOrganisationId } })).nom : "toutes les organisations",
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
      if (invitation.role === Role.MODERATEUR) {
        updateData = {
          organisations: {
            connect: { id: invitation.organisation_id },
          },
        };
      } else if (invitation.role === Role.ADMINISTRATEUR) {
        const allOrganisations = await prisma.organisation.findMany();
        updateData = {
          role: Role.ADMINISTRATEUR,
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
  
      const orgName = invitation.role === Role.MODERATEUR ? invitation.organisation.nom : "toutes les organisations";
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
        if (invitation.role === Role.MODERATEUR) {
            organisationConnect = { connect: { id: invitation.organisation_id } };
        } else if (invitation.role === Role.ADMINISTRATEUR) {
            const allOrganisations = await prisma.organisation.findMany();
            organisationConnect = { connect: allOrganisations.map(org => ({ id: org.id })) };
        }

        const hashPassword = await bcrypt.hashPassword(password);
    
        const newUser = await prisma.user.create({
            data: {
            email: invitation.invitee_email,
            name,
            password: hashPassword,
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
    
        const orgName = invitation.role === Role.MODERATEUR ? invitation.organisation.nom : "toutes les organisations";
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
        if (!admin || admin.role !== Role.ADMINISTRATEUR) {
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
        if (user.role === Role.MODERATEUR) {
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
        } else if (user.role === Role.ADMINISTRATEUR) {
            return res.status(400).json({ error: "Un administrateur ne peut pas etre detaché d'une organisation." });
        }
    
        await prisma.user.update({
            where: { id: user_id },
            data: {
            organisations: updatedOrganisations,
            },
        });
    
        const message = user.role === Role.MODERATEUR
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
        if (!admin) {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent voir la liste des invitations" });
        }
        if (admin.role === Role.ADMINISTRATEUR){
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
        }else{
            const invitations = await prisma.queueInvitationOrganisation.findMany({
                where: {
                    expires_at: { gt: new Date() },
                    inviter_id: admin_id
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
        }
    
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
        if (!admin || admin.role !== Role.ADMINISTRATEUR) {
            return res.status(403).json({ error: "Seuls les administrateurs peuvent annuler des invitations" });
        }
        const invitation = await prisma.queueInvitationOrganisation.findUnique({
            where: { id: parseInt(invitation_id) },
            include: { organisation: true },
        });
        if (!invitation) {
            return res.status(404).json({ error: "Invitation non trouvée" });
        }
        if (admin.role === Role.MODERATEUR && invitation.inviter_id !== admin.id){
            return res.status(401).json({"erreur":"vous n'avez pas l'autorisation pour cette action."})
        }
        if (new Date() > invitation.expires_at) {
            return res.status(400).json({ error: "L'invitation est déjà expirée" });
        }
    
        await prisma.queueInvitationOrganisation.delete({
            where: { id: invitation_id },
        });
    
        const orgName = invitation.role === Role.MODERATEUR && invitation.organisation
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

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Statistiques des utilisateurs
        const userStats = await prisma.user.aggregate({
            _count: {
                id: true,
            },
            where: {
                OR: [
                    { role: Role.ADMINISTRATEUR },
                    { role: Role.MODERATEUR }
                ]
            }
        });

        const adminCount = await prisma.user.count({
            where: { role: Role.ADMINISTRATEUR }
        });

        const moderatorCount = await prisma.user.count({
            where: { role: Role.MODERATEUR }
        });

        // 2. Statistiques des organisations
        const orgStats = await prisma.organisation.aggregate({
            _count: {
                id: true,
            }
        });

        // 3. Statistiques des offres
        const offreStats = await prisma.offre.aggregate({
            _count: {
                id: true,
            },
            _min: {
                nombre_requis: true,
            },
            _max: {
                nombre_requis: true,
            }
        });

        // 4. Top 3 organisations par nombre d'utilisateurs
        const topOrgsByUsers = await prisma.organisation.findMany({
            take: 3,
            orderBy: {
                users: {
                    _count: "desc"
                }
            },
            select: {
                id: true,
                nom: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        // 5. Top 3 organisations par nombre d'offres
        const topOrgsByOffres = await prisma.organisation.findMany({
            take: 3,
            orderBy: {
                offres: {
                    _count: "desc"
                }
            },
            select: {
                id: true,
                nom: true,
                _count: {
                    select: { offres: true }
                }
            }
        });

        // 6. Statistiques des candidats
        const candidateStats = await prisma.candidat.aggregate({
            _count: {
                id: true,
            }
        });

        // 7. Min/Max candidats par offre
        const postulationStats = await prisma.offre.findMany({
            select: {
                id: true,
                titre: true,
                _count: {
                    select: { postulations: true }
                }
            }
        });

        const postulationsPerOffer = postulationStats.map(o => o._count.postulations);
        const minCandidatesPerOffer = Math.min(...postulationsPerOffer);
        const maxCandidatesPerOffer = Math.max(...postulationsPerOffer);

        // 8. Top offres par nombre de postulations
        const topOffresByPostulations = await prisma.offre.findMany({
            take: 3,
            orderBy: {
                postulations: {
                    _count: "desc"
                }
            },
            select: {
                id: true,
                titre: true,
                _count: {
                    select: { postulations: true }
                }
            }
        });

        // 9. Moyenne de postulations par offre
        const avgPostulations = postulationsPerOffer.length > 0 
            ? postulationsPerOffer.reduce((a, b) => a + b, 0) / postulationsPerOffer.length 
            : 0;

        // 10. Top candidats par nombre de postulations
        const topCandidatesByPostulations = await prisma.candidat.findMany({
            take: 3,
            orderBy: {
                postulations: {
                    _count: "desc"
                }
            },
            select: {
                id: true,
                nom: true,
                email: true,
                _count: {
                    select: { postulations: true }
                }
            }
        });

        // Construction de la réponse
        const dashboardData = {
            users: {
                total: userStats._count.id,
                admins: adminCount,
                moderators: moderatorCount
            },
            organisations: {
                total: orgStats._count.id,
                topByUsers: topOrgsByUsers.map(org => ({
                    id: org.id,
                    name: org.nom,
                    userCount: org._count.users
                })),
                topByOffres: topOrgsByOffres.map(org => ({
                    id: org.id,
                    name: org.nom,
                    offreCount: org._count.offres
                }))
            },
            offres: {
                total: offreStats._count.id,
                minRequired: offreStats._min.nombre_requis,
                maxRequired: offreStats._max.nombre_requis,
                topByPostulations: topOffresByPostulations.map(offre => ({
                    id: offre.id,
                    title: offre.titre,
                    postulationCount: offre._count.postulations
                })),
                avgPostulationsPerOffer: Number(avgPostulations.toFixed(2))
            },
            candidates: {
                total: candidateStats._count.id,
                minPerOffer: minCandidatesPerOffer,
                maxPerOffer: maxCandidatesPerOffer,
                topByPostulations: topCandidatesByPostulations.map(candidat => ({
                    id: candidat.id,
                    name: candidat.nom,
                    email: candidat.email,
                    postulationCount: candidat._count.postulations
                }))
            }
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Erreur dans getDashboardStats:", error);
        res.status(500).json({
            success: false,
            error: "Erreur serveur lors de la récupération des statistiques"
        });
    }
}

exports.scheduleMeeting = async(req, res) => {
    try {
        const { users, candidats, start_time, start_date, duration } = req.body;

        if (!Array.isArray(users) || !Array.isArray(candidats) || !start_time || !start_date || !duration) {
            return res.status(400).json({ error: "Tous les champs sont requis : users, candidats, start_time, start_date, duration" });
        }
        if (!/^\d{2}:\d{2}$/.test(start_time)) {
            return res.status(400).json({ error: "start_time doit être au format HH:mm" });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
            return res.status(400).json({ error: "start_date doit être au format YYYY-MM-DD" });
        }

        if (!Number.isInteger(duration) || duration <= 0) {
            return res.status(400).json({ error: "duration doit être un entier positif (en minutes)" });
        }
        const userList = await prisma.user.findMany({
            where: { id: { in: users } },
            select: { id: true, email: true, name: true }
        });

        const candidatList = await prisma.candidat.findMany({
            where: { id: { in: candidats } },
            select: { id: true, email: true, nom: true }
        });

        if (userList.length !== users.length || candidatList.length !== candidats.length) {
            return res.status(400).json({ error: "Certains utilisateurs ou candidats n'existent pas" });
        }
        const [hours, minutes] = start_time.split(':');
        const startDateTime = new Date(`${start_date}T${hours}:${minutes}:00Z`);
        if (isNaN(startDateTime.getTime())) {
            return res.status(400).json({ error: "Date ou heure invalide" });
        }

        const summary = `Réunion planifiée par ${req.user.name}`;
        const description = `Réunion avec ${users.length} utilisateurs et ${candidats.length} candidats`;
        const meetLink = await createGoogleMeet(startDateTime.toISOString(), duration, summary, description);

        if (!meetLink) {
            return res.status(500).json({ error: "Échec de la création du Google Meet" });
        }
        const dateStr = startDateTime.toLocaleDateString('fr-CA', { timeZone: 'UTC' });
        const timeStr = startDateTime.toLocaleTimeString('fr-CA', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

        const envoiNotifications = async (recipients, type) => {
            for (const recipient of recipients) {
                await sendEmail({
                    to: recipient.email,
                    subject: `Invitation à une réunion - ${dateStr} à ${timeStr}`,
                    type: existingType.meeting,
                    data: {
                        candidatName: type === 'candidat' ? recipient.nom : recipient.name,
                        offreTitre: "N/A",
                        date: dateStr,
                        heure: timeStr,
                        meetLink: meetLink
                    },
                    saveToNotifications: true
                });
            }
        };

        await envoiNotifications(userList, 'user');
        await envoiNotifications(candidatList, 'candidat');

        console.log("Emails envoyés à tous les participants");

        return res.status(200).json({
            success: true,
            message: "Réunion planifiée et invitations envoyées avec succès",
            meetLink
        });

    } catch (error) {
        console.error("Erreur dans scheduleMeeting:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.deleteAdmin = async (req, res) => {
    try {
        const adminIdToDelete = parseInt(req.params.id);
        const currentUser = req.user;

        const adminToDelete = await prisma.user.findUnique({
            where: { 
                id: adminIdToDelete
            }
        });

        if (!adminToDelete) {
            return res.status(404).json({ error: "Administrateur non trouvé" });
        }

        if (currentUser.id === adminIdToDelete) {
            return res.status(403).json({ error: "Vous ne pouvez pas vous supprimer vous-même" });
        }

        const firstAdmin = await prisma.user.findFirst({
            where: { role: 'ADMINISTRATEUR' },
            orderBy: { id: 'asc' }
        });

        if (firstAdmin && firstAdmin.id === adminIdToDelete) {
            return res.status(403).json({ error: "Le premier administrateur ne peut pas être supprimé" });
        }

        await prisma.user.delete({
            where: { id: adminIdToDelete }
        });

        return res.status(200).json({ message: "Administrateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'administrateur:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const requestingUser = req.user;
        const targetUserId = parseInt(req.params.id);
        if (req.body.role === Role.MODERATEUR && (!req.body.organisations || !Array.isArray(req.body.organisations) || req.body.organisations.length === 0)) {
            return res.status(400).json({ error: "Les organisations doivent être spécifiées pour un Modérateur" });
        }

        if (requestingUser.role !== Role.ADMINISTRATEUR) {
            return res.status(403).json({ error: "Seuls les Administrateurs peuvent modifier les rôles" });
        }
        
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // const firstAdmin = await prisma.user.findFirst({
        //     where: { role: Role.ADMINISTRATEUR },
        //     orderBy: { id: 'asc' }
        // });
        // if (firstAdmin && firstAdmin.id === targetUserId) {
        //     return res.status(403).json({ error: "Le premier administrateur ne peut pas être supprimé" });
        // }

        const newRole = req.body.role;
        if (!newRole || ![Role.ADMINISTRATEUR, Role.MODERATEUR].includes(newRole)) {
            return res.status(400).json({ error: "Rôle invalide. Valeurs possibles : ADMINISTRATEUR, MODERATEUR" });
        }

        let updateData = { role: newRole };

        if (newRole === Role.MODERATEUR && targetUser.role === Role.ADMINISTRATEUR) {
            if (!req.body.organisations || !Array.isArray(req.body.organisations) || req.body.organisations.length === 0) {
                return res.status(400).json({ error: "Les organisations doivent être spécifiées pour un Modérateur" });
            }
            const orgIds = req.body.organisations.map(id => parseInt(id));
            const existingOrgs = await prisma.organisation.findMany({ where: { id: { in: orgIds } } });
            if (existingOrgs.length !== orgIds.length) {
                return res.status(400).json({ error: "Certaines organisations spécifiées n'existent pas" });
            }
            updateData.organisations = {
                set: orgIds.map(id => ({ id })),
            };
        }
        else if (newRole === Role.ADMINISTRATEUR && targetUser.role === Role.MODERATEUR) {
            const allOrgs = await prisma.organisation.findMany();
            const allOrgIds = allOrgs.map(org => ({ id: org.id }));
            updateData.organisations = {
                set: allOrgIds,
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: updateData,
        });
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erreur lors de la modification du rôle :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};



module.exports = exports;
