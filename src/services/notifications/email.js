const nodemailer = require("nodemailer");
const Notification = require("../../models/notification.model");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const templates = {
    referentConfirmation: (candidatName, offreTitre, confirmationLink) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Confirmation de référence</h2>
            <p style="color: #555;">Bonjour,</p>
            <p style="color: #555;">${candidatName} a postulé à l'offre "${offreTitre}" et vous a désigné comme référent. Veuillez confirmer cette référence en cliquant sur le lien ci-dessous :</p>
            <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Confirmer</a>
            <p style="color: #555;">Merci de votre collaboration !</p>
        </div>
    `,

    postulationAcknowledgment: (candidatName, offreTitre) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Accusé de réception</h2>
            <p style="color: #555;">Bonjour ${candidatName},</p>
            <p style="color: #555;">Nous avons bien reçu votre postulation pour l'offre "${offreTitre}". Votre dossier est en cours d'analyse. Nous vous tiendrons informé(e) de l'évolution.</p>
            <p style="color: #555;">Cordialement,<br>L'équipe ATS Québec</p>
        </div>
    `,

    otpValidation: (otp) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Validation de votre inscription</h2>
            <p style="color: #555;">Voici votre code OTP pour valider votre inscription :</p>
            <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
            <p style="color: #555;">Ce code expire dans 10 minutes. Veuillez l'utiliser rapidement.</p>
        </div>
    `,

    forgotPassword: (resetLink) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
            <p style="color: #555;">Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Réinitialiser</a>
            <p style="color: #555;">Ce lien expire dans 10 minutes.</p>
        </div>
    `,

    rejection: (candidatName, offreTitre) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Mise à jour sur votre candidature</h2>
            <p style="color: #555;">Bonjour ${candidatName},</p>
            <p style="color: #555;">Nous vous informons que votre candidature pour l'offre "${offreTitre}" n'a pas été retenue. Merci pour votre intérêt et bonne continuation.</p>
            <p style="color: #555;">Cordialement,<br>L'équipe ATS Québec</p>
        </div>
    `,

    hiring: (candidatName, offreTitre) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Félicitations !</h2>
            <p style="color: #555;">Bonjour ${candidatName},</p>
            <p style="color: #555;">Nous sommes ravis de vous annoncer que vous avez été retenu(e) pour l'offre "${offreTitre}". Nous vous contacterons bientôt pour les prochaines étapes.</p>
            <p style="color: #555;">Cordialement,<br>L'équipe ATS Québec</p>
        </div>
    `,

    meeting: (candidatName, offreTitre, date, heure, meetLink) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Rendez-vous pour entretien</h2>
            <p style="color: #555;">Bonjour ${candidatName},</p>
            <p style="color: #555;">Nous vous invitons à un entretien pour l'offre "${offreTitre}" le ${date} à ${heure}. Voici le lien Google Meet :</p>
            <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Rejoindre</a>
            <p style="color: #555;">Cordialement,<br>L'équipe ATS Québec</p>
        </div>
    `
};

const generateOtp = () => Math.floor(10000000 + Math.random() * 90000000).toString();

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

module.exports = { sendEmail };