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
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #007bff, #00c4ff); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #e6f0ff; font-size: 16px; margin: 5px 0;">Votre partenaire pour l'excellence professionnelle</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Confirmation de Référence</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour,</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    ${candidatName} a postulé à l’offre "<strong>${offreTitre}</strong>" et vous a désigné comme référent. Nous vous prions de bien vouloir confirmer cette référence en cliquant sur le bouton ci-dessous :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationLink}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">Confirmer la Référence</a>
                </div>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Merci de votre collaboration et de votre confiance en notre processus !</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #007bff; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    postulationAcknowledgment: (candidatName, offreTitre) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #28a745, #5cd85a); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #e6ffe6; font-size: 16px; margin: 5px 0;">Votre candidature compte pour nous</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Accusé de Réception</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour ${candidatName},</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Nous sommes heureux de confirmer la réception de votre postulation pour l’offre "<strong>${offreTitre}</strong>". Votre dossier est actuellement en cours d’analyse par notre équipe. Nous vous tiendrons informé(e) dès que possible des prochaines étapes.
                </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #28a745; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    otpValidation: (otp) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #ff6f61, #ff9f87); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #fff; font-size: 16px; margin: 5px 0;">Sécurisez votre compte</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Validation de Votre Inscription</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour,</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Voici votre code OTP pour valider votre inscription :</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="display: inline-block; padding: 15px 25px; background-color: #ff6f61; color: #fff; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 2px;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Ce code est valide pendant 10 minutes. Veuillez l’utiliser rapidement pour sécuriser votre compte.</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #ff6f61; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    forgotPassword: (resetLink) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #6f42c1, #9f7aea); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #e6e6ff; font-size: 16px; margin: 5px 0;">Réinitialisation de mot de passe</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Réinitialisation de Votre Mot de Passe</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour,</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder à cette opération :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #6f42c1; color: #fff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">Réinitialiser Maintenant</a>
                </div>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Ce lien est valide pendant 10 minutes. Si vous n’avez pas initié cette demande, ignorez cet email.</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #6f42c1; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    rejection: (candidatName, offreTitre) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #dc3545, #ff6b6b); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #ffe6e6; font-size: 16px; margin: 5px 0;">Mise à jour de votre candidature</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Mise à Jour sur Votre Candidature</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour ${candidatName},</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Nous vous remercions pour l’intérêt porté à l’offre "<strong>${offreTitre}</strong>". Après une analyse approfondie, nous sommes au regret de vous informer que votre candidature n’a pas été retenue cette fois-ci. Nous vous souhaitons beaucoup de succès dans vos recherches futures.
                </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #dc3545; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    hiring: (candidatName, offreTitre) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #17a2b8, #48d1cc); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #e6ffff; font-size: 16px; margin: 5px 0;">Une excellente nouvelle vous attend !</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Félicitations, ${candidatName} !</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour ${candidatName},</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Nous sommes ravis de vous annoncer que vous avez été retenu(e) pour l’offre "<strong>${offreTitre}</strong>" ! Votre talent et votre engagement ont fait la différence. Nous vous contacterons sous peu pour les prochaines étapes de votre intégration.
                </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #17a2b8; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    meeting: (candidatName, offreTitre, date, heure, meetLink) => `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #ffc107, #ffd761); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
                <p style="color: #fff8e6; font-size: 16px; margin: 5px 0;">Votre rendez-vous est confirmé</p>
            </div>
            <!-- Body -->
            <div style="padding: 30px; background-color: #fff;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Rendez-Vous pour Votre Entretien</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour ${candidatName},</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Nous avons le plaisir de vous inviter à un entretien pour l’offre "<strong>${offreTitre}</strong>". Voici les détails de votre rendez-vous :
                </p>
                <ul style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    <li><strong>Date :</strong> ${date}</li>
                    <li><strong>Heure :</strong> ${heure}</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${meetLink}" style="display: inline-block; padding: 12px 30px; background-color: #ffc107; color: #fff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">Rejoindre via Google Meet</a>
                </div>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Nous avons hâte de discuter avec vous !</p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
                <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
                <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #ffc107; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    existingUserInvitation: (inviteeName, organisationName, inviterName, invitationLink, role) => `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(90deg, #007bff, #00c4ff); padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
        <p style="color: #e6f0ff; font-size: 16px; margin: 5px 0;">Rejoignez une organisation</p>
      </div>
      <div style="padding: 30px; background-color: #fff;">
        <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Invitation à rejoindre ${organisationName}</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour ${inviteeName},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          ${inviterName} vous a invité(e) à rejoindre l’organisation "<strong>${organisationName}</strong>" en tant que ${role}. Cliquez sur le bouton ci-dessous pour accepter :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold;">Accepter l'invitation</a>
        </div>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Ce lien est valide pendant 24 heures.</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
        <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #007bff; text-decoration: none;">support@atsquebec.com</a></p>
      </div>
    </div>
  `,

  newUserInvitation: (inviteeEmail, organisationName, inviterName, invitationLink, role) => `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(90deg, #28a745, #5cd85a); padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">ATS Québec</h1>
        <p style="color: #e6ffe6; font-size: 16px; margin: 5px 0;">Bienvenue dans une nouvelle aventure</p>
      </div>
      <div style="padding: 30px; background-color: #fff;">
        <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Invitation à rejoindre ${organisationName}</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Bonjour,</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          ${inviterName} vous a invité(e) à rejoindre l’organisation "<strong>${organisationName}</strong>" en tant que ${role}. Cliquez sur le bouton ci-dessous pour créer votre compte et accepter :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold;">Créer mon compte</a>
        </div>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Ce lien est valide pendant 24 heures.</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Cordialement,<br><strong>L’équipe ATS Québec</strong></p>
        <p style="margin: 10px 0 0;">ATS Québec | <a href="mailto:support@atsquebec.com" style="color: #28a745; text-decoration: none;">support@atsquebec.com</a></p>
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
    newUserInvitation: "newUserInvitation"
}

async function sendEmail({ to, subject, type, data, saveToNotifications = false }) {
    let htmlContent;
    let notificationData;

    switch (type) {
        case "referentConfirmation":
            htmlContent = templates.referentConfirmation(data.candidatName, data.offreTitre, data.confirmationLink);
            notificationData = {
                titre: `Confirmation de référence pour ${data.candidatName}`,
                contenu: `Un email a été envoyé au référent pour confirmer la référence de ${data.candidatName} pour l'offre "${data.offreTitre}".`
            };
            break;
        case "postulationAcknowledgment":
            htmlContent = templates.postulationAcknowledgment(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Accusé de réception pour ${data.candidatName}`,
                contenu: `Postulation de ${data.candidatName} pour l'offre "${data.offreTitre}" bien reçue et en cours d'analyse.`
            };
            break;
        case "otpValidation":
            htmlContent = templates.otpValidation(data.otp);
            break;
        case "forgotPassword":
            htmlContent = templates.forgotPassword(data.resetLink);
            break;
        case "rejection":
            htmlContent = templates.rejection(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Rejet de candidature pour ${data.candidatName}`,
                contenu: `La candidature de ${data.candidatName} pour l'offre "${data.offreTitre}" a été rejetée.`
            };
            break;
        case "hiring":
            htmlContent = templates.hiring(data.candidatName, data.offreTitre);
            notificationData = {
                titre: `Embauche de ${data.candidatName}`,
                contenu: `${data.candidatName} a été retenu(e) pour l'offre "${data.offreTitre}".`
            };
            break;
        case "meeting":
            htmlContent = templates.meeting(data.candidatName, data.offreTitre, data.date, data.heure, data.meetLink);
            notificationData = {
                titre: `Entretien pour ${data.candidatName}`,
                contenu: `Rendez-vous fixé pour ${data.candidatName} le ${data.date} à ${data.heure} pour l'offre "${data.offreTitre}".`
            };
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

    if (saveToNotifications && notificationData) {
        await Notification.create(notificationData);
    }
}


module.exports = { sendEmail , existingType};