require("dotenv").config()
const nodemailer = require("nodemailer");
const Notification = require("../../models/notification.model");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_MAIL_LOGIN,
        pass: process.env.USER_MAIL_PASSWORD
    }
});

const templates = {
    referentConfirmation: (candidatName, offreTitre, confirmationLink) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #007bff, #00d4ff); padding: 40px 20px; text-align: center; position: relative;">
                <img src="https://via.placeholder.com/50/007bff/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #d9efff; font-size: 16px; margin: 8px 0 0;">Excellence et Opportunités</p>
            </div>
            <!-- Body -->
            <div style="padding: 40px 30px; background-color: #ffffff; text-align: left;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Confirmation de Référence</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour,</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    ${candidatName} a postulé pour l’offre "<strong style="color: #007bff;">${offreTitre}</strong>" et vous a désigné comme référent. Votre validation est essentielle pour avancer dans ce processus.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #007bff, #00c4ff); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,123,255,0.3); transition: transform 0.2s;">Confirmer Maintenant</a>
                </div>
                <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; margin: 0;">Merci de votre soutien dans ce processus !</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #007bff; text-decoration: none;">support@atsquebec.com</a> | <a href="https://atsquebec.com" style="color: #007bff; text-decoration: none;">atsquebec.com</a></p>
            </div>
        </div>
    `,

    postulationAcknowledgment: (candidatName, offreTitre) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #28a745, #48bb78); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/28a745/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #d4f4dd; font-size: 16px; margin: 8px 0 0;">Votre avenir commence ici</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Candidature bien reçue</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${candidatName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    Nous avons bien reçu votre candidature pour "<strong style="color: #28a745;">${offreTitre}</strong>". Notre équipe examine actuellement votre dossier, et nous vous contacterons bientôt pour la suite.
                </p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; font-size: 14px; color: #166534;">
                    Restez à l’écoute pour les prochaines étapes !
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #28a745; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    otpValidation: (otp) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #ff6f61, #ff9f87); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/ff6f61/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #ffe6e6; font-size: 16px; margin: 8px 0 0;">Sécurisez votre compte</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Code de Validation</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour,</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Utilisez ce code pour valider votre inscription :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; padding: 20px 30px; background: linear-gradient(90deg, #ff6f61, #ff9f87); color: #ffffff; font-size: 28px; font-weight: 700; border-radius: 12px; letter-spacing: 3px; box-shadow: 0 4px 12px rgba(255,111,97,0.3);">${otp}</span>
                </div>
                <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; text-align: center;">Valable 10 minutes</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #ff6f61; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    forgotPassword: (resetLink) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #6f42c1, #9f7aea); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/6f42c1/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #e6e6ff; font-size: 16px; margin: 8px 0 0;">Réinitialisation sécurisée</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Réinitialiser Votre Mot de Passe</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour,</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #6f42c1, #9f7aea); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(111,66,193,0.3);">Réinitialiser</a>
                </div>
                <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; text-align: center;">Lien valide pendant 10 minutes. Ignorez si ce n’était pas vous.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #6f42c1; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    rejection: (candidatName, offreTitre) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #dc3545, #f87171); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/dc3545/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #fee2e2; font-size: 16px; margin: 8px 0 0;">Mise à jour de votre candidature</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Résultat de Votre Candidature</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${candidatName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    Merci pour votre candidature à "<strong style="color: #dc3545;">${offreTitre}</strong>". Après examen, nous ne pouvons pas donner suite cette fois-ci. Nous vous souhaitons plein de succès dans vos projets futurs !
                </p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #dc3545; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    hiring: (candidatName, offreTitre) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #17a2b8, #36d1dc); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/17a2b8/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #d1f5fa; font-size: 16px; margin: 8px 0 0;">Félicitations !</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Vous êtes retenu(e), ${candidatName} !</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${candidatName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    Nous sommes ravis de vous annoncer que vous avez été sélectionné(e) pour "<strong style="color: #17a2b8;">${offreTitre}</strong>" ! Nous vous contacterons bientôt pour la suite.
                </p>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 8px; text-align: center; font-size: 14px; color: #0d6e6e;">
                    Bienvenue dans l’aventure ATS Québec !
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #17a2b8; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    meeting: (candidatName, offreTitre, date, heure, meetLink) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #ffc107, #ffd54f); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/ffc107/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #fff3d6; font-size: 16px; margin: 8px 0 0;">Votre entretien est planifié</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Entretien pour ${offreTitre}</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${candidatName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Voici les détails de votre entretien :</p>
                <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #713f12; font-size: 16px; margin: 0;"><strong>Date :</strong> ${date}</p>
                    <p style="color: #713f12; font-size: 16px; margin: 10px 0 0;"><strong>Heure :</strong> ${heure}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${meetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #ffc107, #ffd54f); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255,193,7,0.3);">Rejoindre l’entretien</a>
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #ffc107; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    existingUserInvitation: (inviteeName, organisationName, inviterName, invitationLink, role) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <div style="background: linear-gradient(135deg, #007bff, #00d4ff); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/007bff/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #d9efff; font-size: 16px; margin: 8px 0 0;">Une nouvelle opportunité vous attend</p>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Invitation à ${organisationName}</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${inviteeName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    ${inviterName} vous invite à rejoindre "<strong style="color: #007bff;">${organisationName}</strong>" en tant que ${role}. Acceptez dès maintenant :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #007bff, #00d4ff); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,123,255,0.3);">Accepter</a>
                </div>
                <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; text-align: center;">Valable 24 heures</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #007bff; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    newUserInvitation: (inviteeEmail, organisationName, inviterName, invitationLink, role) => `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
        <div style="background: linear-gradient(135deg, #28a745, #48bb78); padding: 40px 20px; text-align: center;">
            <img src="https://via.placeholder.com/50/28a745/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
            <p style="color: #d4f4dd; font-size: 16px; margin: 8px 0 0;">Bienvenue à bord !</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Rejoignez ${organisationName}</h2>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour,</p>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                ${inviterName} vous invite à rejoindre "<strong style="color: #28a745;">${organisationName}</strong>" en tant que ${role}. Créez votre compte pour commencer :
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #28a745, #48bb78); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(40,167,69,0.3);">Créer mon compte</a>
            </div>
            <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; text-align: center;">Valable 24 heures</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">L’équipe ATS Québec</p>
            <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #28a745; text-decoration: none;">support@atsquebec.com</a></p>
        </div>
    </div>
    `,

    recruitmentProcess: (candidatName, offreTitre, processType, description, url, duree) => `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #007bff, #00d4ff); padding: 40px 20px; text-align: center;">
                <img src="https://via.placeholder.com/50/007bff/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
                <p style="color: #d9efff; font-size: 16px; margin: 8px 0 0;">Votre parcours de recrutement</p>
            </div>
            <!-- Body -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Processus de recrutement - ${processType}</h2>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour ${candidatName},</p>
                <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                    Le processus de recrutement pour l'offre "<strong style="color: #007bff;">${offreTitre}</strong>" commence maintenant. Voici les détails :
                </p>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #1a2b49; font-size: 16px; margin: 0 0 10px;"><strong>Type :</strong> ${processType}</p>
                    <p style="color: #1a2b49; font-size: 16px; margin: 0 0 10px;"><strong>Description :</strong> ${description}</p>
                    <p style="color: #1a2b49; font-size: 16px; margin: 0;"><strong>Durée :</strong> ${duree} minutes</p>
                </div>
                ${
                    url ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${url}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(90deg, #007bff, #00c4ff); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,123,255,0.3);">Commencer maintenant</a>
                    </div>
                    ` : ''
                }
                <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; margin: 0;">Bonne chance dans cette étape !</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0;">L’équipe ATS Québec</p>
                <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #007bff; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    supportClientToAdmin: (type, sujet, contenu, emailSource) => `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
        <div style="background: linear-gradient(135deg, #6b7280, #9ca3af); padding: 40px 20px; text-align: center;">
            <img src="https://via.placeholder.com/50/6b7280/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
            <p style="color: #e5e7eb; font-size: 16px; margin: 8px 0 0;">Demande de Support</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Nouvelle Demande de Support</h2>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour,</p>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Une nouvelle demande de support a été soumise par <strong style="color: #6b7280;">${emailSource}</strong>.
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #1a2b49; font-size: 16px; margin: 0 0 10px;"><strong>Type :</strong> ${type === 'CANDIDAT' ? 'Candidat' : 'Responsable'}</p>
                <p style="color: #1a2b49; font-size: 16px; margin: 0 0 10px;"><strong>Sujet :</strong> ${sujet}</p>
                <p style="color: #1a2b49; font-size: 16px; margin: 0;"><strong>Contenu :</strong> ${contenu}</p>
            </div>
            <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; margin: 0;">
                Répondez directement à <a href="mailto:${emailSource}" style="color: #6b7280; text-decoration: none;">${emailSource}</a>.
            </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">L’équipe ATS Québec</p>
            <p style="margin: 8px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #6b7280; text-decoration: none;">support@atsquebec.com</a></p>
        </div>
    </div>
  `,

  supportToTechnical: (sujet, contenu, emailSource) => `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
        <div style="background: linear-gradient(135deg, #ef4444, #f87171); padding: 40px 20px; text-align: center;">
            <img src="https://via.placeholder.com/50/ef4444/ffffff?text=ATS" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ATS Québec</h1>
            <p style="color: #fee2e2; font-size: 16px; margin: 8px 0 0;">Demande au Support Technique</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1a2b49; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Demande de Support Technique</h2>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Bonjour Équipe Technique,</p>
            <p style="color: #4a5b76; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Une demande a été soumise par <strong style="color: #ef4444;">${emailSource}</strong>.
            </p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #1a2b49; font-size: 16px; margin: 0 0 10px;"><strong>Sujet :</strong> ${sujet}</p>
                <p style="color: #1a2b49; font-size: 16px; margin: 0;"><strong>Contenu :</strong> ${contenu}</p>
            </div>
            <p style="color: #4a5b76; font-size: 14px; line-height: 1.6; margin: 0;">
                Répondez directement à <a href="mailto:${emailSource}" style="color: #ef4444; text-decoration: none;">${emailSource}</a>.
            </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">L’équipe ATS Québec</p>
        </div>
    </div>
  `,
};

const existingType = {
    referentConfirmation: "referentConfirmation",
    postulationAcknowledgment: "postulationAcknowledgment",
    otpValidation: "otpValidation",
    forgotPassword: "forgotPassword",
    rejection: "rejection",
    hiring: "hiring",
    meeting: "meeting",
    existingUserInvitation: "existingUserInvitation",
    newUserInvitation: "newUserInvitation",
    recruitmentProcess: "recruitmentProcess",
    supportClientToAdmin: "supportClientToAdmin",
    supportToTechnical: "supportToTechnical",
}

async function sendEmail({ to, subject, type, data, saveToNotifications = false }) {
    let htmlContent;
    let notificationData;

    switch (type) {
        case existingType.referentConfirmation:
            htmlContent = templates.referentConfirmation(data.candidatName, data.offreTitre, data.confirmationLink);
            notificationData = {
                titre: `Confirmation de référence pour ${data.candidatName}`,
                contenu: `Un email a été envoyé au référent pour confirmer la référence de ${data.candidatName} pour l'offre "${data.offreTitre}".`
            };
            break;
        case existingType.postulationAcknowledgment:
            htmlContent = templates.postulationAcknowledgment(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Accusé de réception pour ${data.candidatName}`,
                contenu: `Postulation de ${data.candidatName} pour l'offre "${data.offreTitre}" bien reçue et en cours d'analyse.`
            };
            break;
        case existingType.otpValidation:
            htmlContent = templates.otpValidation(data.otp);
            break;
        case existingType.forgotPassword:
            htmlContent = templates.forgotPassword(data.resetLink);
            break;
        case existingType.rejection:
            htmlContent = templates.rejection(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Rejet de candidature pour ${data.candidatName}`,
                contenu: `La candidature de ${data.candidatName} pour l'offre "${data.offreTitre}" a été rejetée.`
            };
            break;
        case existingType.hiring:
            htmlContent = templates.hiring(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Embauche de ${data.candidatName}`,
                contenu: `${data.candidatName} a été retenu(e) pour l'offre "${data.offreTitre}".`
            };
            break;
        case existingType.meeting:
            htmlContent = templates.meeting(data.candidatName, data.offreTitre, data.date, data.heure, data.meetLink);
            notificationData = {
                titre: `Entretien pour ${data.candidatName}`,
                contenu: `Rendez-vous fixé pour ${data.candidatName} le ${data.date} à ${data.heure} pour l'offre "${data.offreTitre}".`
            };
            break;
        case existingType.existingUserInvitation:
            htmlContent = templates.existingUserInvitation(data.inviteeName, data.organisationName, data.inviterName, data.invitationLink, data.role);
            notificationData = {
                titre: `Invitation de ${data.inviteeName} dans l'organisation ${data.organisationName}`,
                contenu: `${data.inviterName} a invité(e) ${data.inviteeEmail} à rejoindre l’organisation ${data.organisationName} en tant que ${data.role}.`
            };
            break;
        case existingType.newUserInvitation:
            htmlContent = templates.newUserInvitation(data.inviteeName, data.organisationName, data.inviterName, data.invitationLink, data.role);
            notificationData = {
                titre: `Invitation de ${data.inviteeName} dans l'organisation ${data.organisationName}`,
                contenu: `${data.inviterName} a invité(e) ${data.inviteeEmail} à rejoindre l’organisation ${data.organisationName} en tant que ${data.role}.`
            };
            break;
        case existingType.recruitmentProcess:
            htmlContent = templates.recruitmentProcess(data.candidatName, data.offreTitre, data.processType, data.description, data.url, data.duree);
            notificationData = {
                titre: `Début du processus "${data.processType}" pour ${data.candidatName}`,
                contenu: `Le processus de recrutement "${data.processType}" pour l'offre "${data.offreTitre}" a démarré pour ${data.candidatName}.`
            };
            break;
        case existingType.supportClientToAdmin:
            htmlContent = templates.supportClientToAdmin(data.type, data.sujet, data.contenu, data.emailSource);
            notificationData = {
                titre: `Nouvelle demande de support - ${data.sujet}`,
                contenu: `Une demande de support de type "${data.type}" a été soumise par ${data.emailSource}.`,
            };
            break;
        case existingType.supportToTechnical:
            htmlContent = templates.supportToTechnical(data.sujet, data.contenu, data.emailSource);
            break;
        default:
            throw new Error("Type d'email non reconnu");
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    if (saveToNotifications && notificationData && notificationData) {
        await Notification.create(notificationData);
    }
}


module.exports = { sendEmail , existingType};