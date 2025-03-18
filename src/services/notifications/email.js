require("dotenv").config();
const nodemailer = require('nodemailer');

async function sendEmail(to, title = "Notification", username, message, base_url = "") {
    logoUrl = base_url + "/uploads/quebec.png"
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL_LOGIN,
            pass: process.env.USER_MAIL_PASSWORD
        }
    });

    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f0f2f5; color: #333; padding: 0; margin: 0; }
            .container { max-width: 600px; margin: 50px auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            h2 { color: #007bff; font-size: 24px; margin-bottom: 20px; }
            p { font-size: 16px; color: #555; }
            .button { display: inline-block; padding: 15px 25px; background-color: #25D366; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px; transition: 0.3s; font-weight: bold; }
            .button:hover { background-color: #1ebe57; }
            .footer { margin-top: 30px; font-size: 14px; color: #777; text-align: center; }
            .logo { text-align: center; margin-bottom: 20px; }
            .logo img { max-width: 150px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="${logoUrl}" alt="Logo">
            </div>
            <h2>${title}</h2>
            <p>Bonjour <strong>${username}</strong>,</p>
            <p>${message}</p>
            <p>Pour recevoir vos notifications via WhatsApp, cliquez sur ce bouton :</p>
            <p style="text-align:center;">
                <a href="${whatsapp_link}" class="button" target="_blank">Activer via WhatsApp</a>
            </p>
            <p>Cordialement,<br>L'équipe</p>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Notre Plateforme. Tous droits réservés.
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: '"Centre de service scolaire" <raphaeltokinandrasana@gmail.com>',
        to: to,
        subject: "Notification de votre compte " + username,
        html: emailTemplate
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email envoyé avec succès à " + to);
        return true;
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        return false;
    }
}

module.exports = { sendEmail }
