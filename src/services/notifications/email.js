require("dotenv").config()
const nodemailer = require("nodemailer");
const Notification = require("../../models/notification.model");

const LOGO_ATS = "https://res-console.cloudinary.com/djzflrl1u/thumbnails/v1/image/upload/v1743947921/V2hhdHNBcHBfSW1hZ2VfMjAyNS0wNC0wNl_DoF8xNi41Ni40Ml8yNGJiMDFiZV9tbHBhZWs=/drilldown"

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const templates = {
    referentConfirmation: (candidatName, offreTitre, confirmationLink) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Header with 3D effect -->
            <div style="background: linear-gradient(135deg, #4361ee, #3a0ca3); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -40px; left: -40px;"></div>
                <div style="position: absolute; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -20px; right: 60px;"></div>
                <img src="${LOGO_ATS}" alt="ATS Logo" style="width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.2); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #d9efff; font-size: 16px; margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase;">Référence Professionnelle</p>
            </div>
            <!-- Body with modern layout -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 20px; right: -100px; opacity: 0.6;"></div>
                <div style="position: relative; z-index: 1;">
                    <h2 style="color: #2d3748; font-size: 28px; font-weight: 700; margin-bottom: 25px; border-bottom: 2px solid #f0f4ff; padding-bottom: 15px;">Confirmation de Référence</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">Bonjour,</p>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                        <span style="background: linear-gradient(to right, #4361ee, #3a0ca3); -webkit-background-clip: text; color: transparent; font-weight: 600;">${candidatName}</span> a postulé pour l'offre "<strong style="color: #4361ee; font-weight: 600;">${offreTitre}</strong>" et vous a désigné comme référent. Votre évaluation joue un rôle crucial dans notre processus de sélection.
                    </p>
                    <div style="padding: 30px; background-color: #f8fafc; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 30px;">
                        <p style="color: #2d3748; font-size: 16px; margin: 0 0 15px; font-weight: 500;">En tant que référent, nous vous invitons à :</p>
                        <ul style="color: #4a5568; padding-left: 20px; margin: 0;">
                            <li style="margin-bottom: 10px;">Évaluer les compétences professionnelles du candidat</li>
                            <li style="margin-bottom: 10px;">Partager votre expérience de travail avec cette personne</li>
                            <li style="margin-bottom: 0;">Nous aider à prendre une décision éclairée</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${confirmationLink}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #4361ee, #3a0ca3); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(67, 97, 238, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                            <span style="display: inline-block; transition: transform 0.2s;">Confirmer Maintenant</span>
                        </a>
                    </div>
                    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">Merci de votre participation au développement professionnel de notre communauté.</p>
                </div>
            </div>
            <!-- Modern Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; color: #4361ee; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; color: #4361ee; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; color: #4361ee; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #4361ee; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #4361ee; text-decoration: none; margin: 0 10px;">atsquebec.com</a> | 
                    <a href="tel:+15141234567" style="color: #4361ee; text-decoration: none; margin: 0 10px;">+1 514-123-4567</a>
                </p>
            </div>
        </div>
    `,

    postulationAcknowledgment: (candidatName, offreTitre) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Modern Animated Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: relative;">
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.2); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
                    <div style="position: absolute; top: 0; right: 50%; margin-right: -50px; background-color: #047857; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #ffffff;"></div>
                    </div>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #d1f5dd; font-size: 16px; margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase;">Candidature Reçue</p>
            </div>
            <!-- Clean, Modern Body -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                        <p style="color: #047857; font-size: 14px; margin: 0; font-weight: 600;">Candidature confirmée ✓</p>
                    </div>
                    <h2 style="color: #2d3748; font-size: 28px; font-weight: 700; margin-bottom: 25px; border-bottom: 2px solid #f0fdf4; padding-bottom: 15px;">Candidature bien reçue</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">Bonjour <span style="background: linear-gradient(to right, #10b981, #059669); -webkit-background-clip: text; color: transparent; font-weight: 600;">${candidatName}</span>,</p>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                        Nous avons bien reçu votre candidature pour "<strong style="color: #10b981; font-weight: 600;">${offreTitre}</strong>" et nous vous en remercions. Notre équipe de recrutement examine actuellement votre dossier avec attention.
                    </p>
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 30px;">
                        <h3 style="color: #2d3748; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Prochaines étapes</h3>
                        <ul style="color: #4a5568; padding-left: 20px; margin: 0;">
                            <li style="margin-bottom: 10px;">Examen approfondi de votre candidature</li>
                            <li style="margin-bottom: 10px;">Présélection des profils correspondants</li>
                            <li style="margin-bottom: 10px;">Contact pour un éventuel entretien</li>
                            <li style="margin-bottom: 0;">Décision finale</li>
                        </ul>
                    </div>
                    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; font-size: 16px; color: #065f46; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span>Candidature reçue avec succès ! Restez à l'écoute.</span>
                    </div>
                </div>
            </div>
            <!-- Modern Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #10b981; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #10b981; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    otpValidation: (otp) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Header with 3D gradients -->
            <div style="background: linear-gradient(135deg, #f43f5e, #e11d48); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; top: 40px; left: 40px;"></div>
                <div style="position: absolute; width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; bottom: 40px; right: 40px;"></div>
                
                <!-- Logo with shield effect -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 0;"></div>
                    <div style="position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; background: rgba(255,255,255,0.2); border-radius: 50%; z-index: 0;"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; z-index: 1; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #fecdd3; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase;">Code de Vérification</p>
            </div>
            
            <!-- Body with modern layout -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: center; position: relative;">
                <!-- Background decorative elements -->
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: absolute; width: 150px; height: 150px; background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 20px; right: -50px; opacity: 0.6;"></div>
                
                <!-- Content with shield icon -->
                <div style="position: relative; z-index: 1;">
                    <div style="width: 70px; height: 70px; background-color: #ffe4e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.9099 11.1198C20.9099 16.0098 17.3599 20.5898 12.5099 21.9298C12.1799 22.0198 11.8199 22.0198 11.4899 21.9298C6.63988 20.5898 3.08988 16.0098 3.08988 11.1198V6.72979C3.08988 5.90979 3.70988 5.17979 4.51988 5.04979C8.21988 4.40979 9.69988 3.39979 11.9999 1.55979C14.2999 3.39979 15.7799 4.40979 19.4799 5.04979C20.2899 5.17979 20.9099 5.90979 20.9099 6.72979V11.1198Z" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #2d3748; font-size: 28px; font-weight: 700; margin-bottom: 20px;">Sécurisez votre compte</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">Utilisez ce code unique pour valider votre inscription et sécuriser votre compte.</p>
                    
                    <!-- OTP display with animation effect -->
                    <div style="margin: 40px auto; max-width: 320px;">
                        <div style="display: flex; justify-content: center;">
                            ${otp.split('').map(digit => `
                                <div style="width: 65px; height: 80px; border-radius: 12px; background: linear-gradient(145deg, #f9fafb, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin: 0 5px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #f43f5e 0%, #fb7185 100%); border-radius: 4px 4px 0 0;"></div>
                                    <span style="font-size: 32px; font-weight: 700; color: #0f172a;">${digit}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Timer with circular progress indicator -->
                    <div style="background-color: #fef2f2; padding: 15px 25px; border-radius: 50px; display: inline-flex; align-items: center; margin: 20px auto 30px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <circle cx="12" cy="12" r="10" stroke="#fecdd3" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style="color: #e11d48; font-weight: 600; font-size: 14px;">Valable 10 minutes</span>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 5px;">Vous n'avez pas demandé ce code ?</p>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                        <a href="mailto:support@atsquebec.com" style="color: #f43f5e; text-decoration: underline; font-weight: 500;">Contactez-nous immédiatement</a>
                    </p>
                </div>
            </div>
            
            <!-- Footer with clean design -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #f43f5e; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #f43f5e; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    forgotPassword: (resetLink) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Gradient header with 3D elements -->
            <div style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative floating elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; top: 70px; left: 70px;"></div>
                <div style="position: absolute; width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; bottom: 60px; right: 100px;"></div>
                
                <!-- Animated logo container with glow effect -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; background: rgba(167, 139, 250, 0.3); border-radius: 50%; filter: blur(10px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #ddd6fe; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase;">Réinitialisation de Mot de Passe</p>
            </div>
            
            <!-- Modern body layout with floating elements -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: center; position: relative;">
                <!-- Background decorative elements -->
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: absolute; width: 150px; height: 150px; background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 20px; right: -50px; opacity: 0.6;"></div>
                
                <!-- Content with lock icon -->
                <div style="position: relative; z-index: 1;">
                    <div style="width: 70px; height: 70px; background-color: #f3f0ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.9965 16H16.0054" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9945 16H12.0035" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.99451 16H8.00349" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #2d3748; font-size: 28px; font-weight: 700; margin-bottom: 20px;">Réinitialisation de Mot de Passe</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte. Utilisez le bouton ci-dessous pour définir un nouveau mot de passe.</p>
                    
                    <!-- Security notice -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #8b5cf6; padding: 15px; text-align: left; margin-bottom: 30px; border-radius: 4px;">
                        <p style="color: #4b5563; font-size: 14px; margin: 0; font-weight: 500;">Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail ou nous contacter si vous avez des préoccupations.</p>
                    </div>
                    
                    <!-- CTA button with hover effect -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #8b5cf6, #6d28d9); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(139, 92, 246, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                            <span style="display: inline-block; transition: transform 0.2s;">Réinitialiser le Mot de Passe</span>
                        </a>
                    </div>
                    
                    <!-- Timer with icon -->
                    <div style="background-color: #f5f3ff; padding: 15px 25px; border-radius: 50px; display: inline-flex; align-items: center; margin: 0 auto 20px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <circle cx="12" cy="12" r="10" stroke="#d8b4fe" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style="color: #6d28d9; font-weight: 600; font-size: 14px;">Ce lien expire dans 10 minutes</span>
                    </div>
                </div>
            </div>
            
            <!-- Modern footer with social icons -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #8b5cf6; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #8b5cf6; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    rejection: (candidatName, offreTitre) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Subtle gradient header -->
            <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%; top: 60px; left: 60px;"></div>
                
                <!-- Logo with subtle glow -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(5px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.2); box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #f1f5f9; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase;">Mise à jour de candidature</p>
            </div>
            
            <!-- Elegant, empathetic body -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <div style="position: relative; z-index: 1;">                    
                    <h2 style="color: #334155; font-size: 28px; font-weight: 700; margin-bottom: 25px; border-bottom: 2px solid #f8fafc; padding-bottom: 15px;">Résultat de Votre Candidature</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">Bonjour <span style="font-weight: 600;">${candidatName}</span>,</p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                        Nous vous remercions sincèrement pour l'intérêt que vous avez porté à rejoindre notre équipe et pour le temps que vous avez consacré à votre candidature pour le poste de "<strong style="color: #475569;">${offreTitre}</strong>".
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                        Après un examen attentif de tous les dossiers reçus, nous avons le regret de vous informer que votre candidature n'a pas été retenue pour la suite du processus. Cette décision ne reflète en aucun cas vos compétences ou votre potentiel, mais résulte d'une adéquation particulière recherchée pour ce poste spécifique.
                    </p>
                    
                    <!-- Encouraging message -->
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
                        <h3 style="color: #334155; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Un mot d'encouragement</h3>
                        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0;">
                            Nous tenons à vous encourager à poursuivre votre parcours professionnel avec la même passion. Votre profil pourrait parfaitement correspondre à d'autres opportunités au sein de notre organisation à l'avenir, et nous vous invitons à rester attentif à nos futures offres d'emploi.
                        </p>
                    </div>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                        Nous vous souhaitons beaucoup de succès dans vos recherches et dans votre carrière professionnelle.
                    </p>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0;">
                        Cordialement,
                    </p>
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 5px 0 0; font-weight: 600;">
                        L'équipe de recrutement<br>
                        ATS Québec
                    </p>
                </div>
            </div>
            
            <!-- Footer with future opportunities link -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 15px;">Découvrez nos autres opportunités</p>
                <a href="https://atsquebec.com/carrieres" style="display: inline-block; padding: 12px 30px; background-color: #f1f5f9; color: #475569; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 500; border: 1px solid #e2e8f0; transition: all 0.2s ease;">
                    Voir les offres d'emploi
                </a>
                <div style="margin-top: 25px; display: flex; justify-content: center; align-items: center;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 15px 0 0;"><a href="mailto:support@atsquebec.com" style="color: #64748b; text-decoration: none;">support@atsquebec.com</a></p>
            </div>
        </div>
    `,

    hiring: (candidatName, offreTitre) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Celebratory gradient header with confetti -->
            <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Confetti elements -->
                <div style="position: absolute; width: 15px; height: 15px; background: #fcd34d; border-radius: 4px; top: 50px; left: 80px; transform: rotate(15deg);"></div>
                <div style="position: absolute; width: 10px; height: 10px; background: #a7f3d0; border-radius: 50%; top: 90px; left: 40px;"></div>
                <div style="position: absolute; width: 12px; height: 12px; background: #fda4af; border-radius: 4px; top: 40px; right: 80px; transform: rotate(45deg);"></div>
                <div style="position: absolute; width: 8px; height: 8px; background: #c4b5fd; border-radius: 2px; top: 70px; right: 50px; transform: rotate(30deg);"></div>
                <div style="position: absolute; width: 15px; height: 15px; background: #93c5fd; border-radius: 50%; bottom: 50px; left: 100px;"></div>
                <div style="position: absolute; width: 12px; height: 12px; background: #fbcfe8; border-radius: 4px; bottom: 40px; right: 90px; transform: rotate(20deg);"></div>
                
                <!-- Logo with celebration effect -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -12px; left: -12px; right: -12px; bottom: -12px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(8px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 6px solid rgba(255,255,255,0.3); box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 38px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #cffafe; font-size: 18px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Félicitations !</p>
            </div>
            
            <!-- Celebratory body content -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: center; position: relative;">
                <!-- Background decorative elements -->
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #ecfeff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: absolute; width: 150px; height: 150px; background: linear-gradient(135deg, #ecfeff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 20px; right: -50px; opacity: 0.6;"></div>
                
                <!-- Trophy icon -->
                <div style="position: relative; z-index: 1;">
                    <div style="width: 80px; height: 80px; background-color: #ecfeff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.15 16.5V18.6" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.15 22H17.15V21C17.15 19.9 16.25 19 15.15 19H9.15C8.05 19 7.15 19.9 7.15 21V22Z" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.15 22H18.15" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 16C8.13 16 5 12.87 5 9V6C5 3.79 6.79 2 9 2H15C17.21 2 19 3.79 19 6V9C19 12.87 15.87 16 12 16Z" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.47 11.65C4.72 11.41 4.06 10.97 3.54 10.45C2.64 9.44 2.04 8.08 2.04 6.58C2.04 5.08 3.05 3.87 4.35 3.65C5.04 3.56 5.78 3.73 6.35 4.15" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.47 11.65C19.22 11.41 19.88 10.97 20.4 10.45C21.3 9.44 21.9 8.08 21.9 6.58C21.9 5.08 20.89 3.87 19.59 3.65C18.9 3.56 18.16 3.73 17.59 4.15" stroke="#0891b2" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #0e7490; font-size: 32px; font-weight: 800; margin-bottom: 20px;">
                        Votre talent a été reconnu !
                    </h2>
                    <p style="color: #334155; font-size: 18px; line-height: 1.8; margin: 0 0 20px; font-weight: 500;">
                        Félicitations <span style="background: linear-gradient(to right, #0891b2, #06b6d4); -webkit-background-clip: text; color: transparent; font-weight: 700;">${candidatName}</span> !
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                        Nous sommes ravis de vous annoncer que votre candidature pour le poste de 
                        <strong style="color: #0891b2; font-weight: 600; font-size: 18px;">${offreTitre}</strong> 
                        a été retenue ! Après un processus de recrutement rigoureux, votre profil s'est démarqué et nous sommes enthousiastes à l'idée de vous accueillir dans notre équipe.
                    </p>
                    
                    <!-- Celebration box -->
                    <div style="background-color: #f0fdfa; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(8, 145, 178, 0.1); margin-bottom: 30px; border-top: 4px solid #0891b2;">
                        <h3 style="color: #0e7490; font-size: 20px; margin: 0 0 15px; font-weight: 600;">Que se passe-t-il maintenant ?</h3>
                        <div style="display: flex; align-items: flex-start; text-align: left; margin-bottom: 15px;">
                            <div style="min-width: 28px; height: 28px; background-color: #0891b2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; margin-top: 2px;">
                                <span style="color: white; font-weight: 600; font-size: 14px;">1</span>
                            </div>
                            <div>
                                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; font-weight: 500;">Un membre de notre équipe vous contactera très prochainement pour discuter des prochaines étapes.</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: flex-start; text-align: left; margin-bottom: 15px;">
                            <div style="min-width: 28px; height: 28px; background-color: #0891b2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; margin-top: 2px;">
                                <span style="color: white; font-weight: 600; font-size: 14px;">2</span>
                            </div>
                            <div>
                                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; font-weight: 500;">Nous vous enverrons votre contrat et toutes les informations importantes concernant votre intégration.</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: flex-start; text-align: left;">
                            <div style="min-width: 28px; height: 28px; background-color: #0891b2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; margin-top: 2px;">
                                <span style="color: white; font-weight: 600; font-size: 14px;">3</span>
                            </div>
                            <div>
                                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; font-weight: 500;">Vous serez convié(e) à une journée d'accueil pour vous présenter votre nouvelle équipe et nos locaux.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #ecfeff; padding: 20px; border-radius: 12px; text-align: center; font-size: 18px; color: #0e7490; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Bienvenue dans l'aventure ATS Québec !</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer with social proof -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 20px; font-size: 16px; font-weight: 500; color: #334155;">Rejoignez-nous sur les réseaux sociaux</p>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 32px; height: 32px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 32px; height: 32px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 32px; height: 32px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #0891b2; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #0891b2; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    meeting: (candidatName, offreTitre, date, heure, meetLink) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Vibrant header with calendar-inspired elements -->
            <div style="background: linear-gradient(135deg, #eab308, #facc15); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative calendar elements -->
                <div style="position: absolute; width: 30px; height: 30px; background: #ffffff33; border-radius: 6px; top: 40px; left: 40px; transform: rotate(10deg);"></div>
                <div style="position: absolute; width: 40px; height: 40px; background: #ffffff33; border-radius: 8px; bottom: 40px; right: 60px; transform: rotate(-15deg);"></div>
                <div style="position: absolute; width: 20px; height: 20px; background: #ffffff33; border-radius: 4px; top: 70px; right: 80px; transform: rotate(30deg);"></div>
                
                <!-- Logo with shadow effect -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(6px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #fff8e1; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Entretien Confirmé</p>
            </div>
            
            <!-- Modern calendar-style body -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <!-- Content with meeting icon -->
                <div style="position: relative; z-index: 1;">
                    <div style="width: 70px; height: 70px; background-color: #fef9c3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 2V5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.5 9.09H20.5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.6947 13.7H15.7037" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.6947 16.7H15.7037" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9955 13.7H12.0045" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9955 16.7H12.0045" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.29431 13.7H8.30329" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.29431 16.7H8.30329" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #2d3748; font-size: 28px; font-weight: 700; margin-bottom: 20px; text-align: center;">Entretien pour ${offreTitre}</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px; text-align: center;">
                        Bonjour <span style="background: linear-gradient(to right, #eab308, #facc15); -webkit-background-clip: text; color: transparent; font-weight: 700;">${candidatName}</span>,
                    </p>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px; text-align: center;">
                        Nous avons le plaisir de confirmer votre entretien pour le poste de <strong style="color: #ca8a04;">${offreTitre}</strong>. Veuillez trouver ci-dessous les détails de cette rencontre.
                    </p>
                    
                    <!-- Calendar-style meeting details -->
                    <div style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 30px; overflow: hidden; border: 1px solid #f3f4f6;">
                        <!-- Calendar header -->
                        <div style="background-color: #fef9c3; padding: 20px; text-align: center; border-bottom: 1px solid #fef08a;">
                            <h3 style="color: #ca8a04; font-size: 18px; margin: 0; font-weight: 600;">Détails de l'entretien</h3>
                        </div>
                        
                        <!-- Calendar body -->
                        <div style="padding: 30px;">
                            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 2V5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M16 2V5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M3.5 9.09H20.5" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#ca8a04" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Date</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 600;">${date}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Heure</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 600;">${heure}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 13H5.76C6.52 13 7.21 13.43 7.55 14.11L8.44 15.9C9 17 10 17 10.24 17H13.77C14.53 17 15.22 16.57 15.56 15.89L16.45 14.1C16.79 13.42 17.48 12.99 18.24 12.99H22" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Format</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 600;">Entretien vidéo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preparation tips -->
                    <div style="background-color: #fef9c3; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                        <h3 style="color: #854d0e; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Comment se préparer</h3>
                        <ul style="color: #713f12; padding-left: 20px; margin: 0;">
                            <li style="margin-bottom: 8px;">Vérifiez votre connexion internet et votre équipement audio/vidéo</li>
                            <li style="margin-bottom: 8px;">Installez-vous dans un endroit calme et bien éclairé</li>
                            <li style="margin-bottom: 8px;">Préparez des questions sur le poste ou l'entreprise</li>
                            <li style="margin-bottom: 0;">Prévoyez 45-60 minutes pour l'entretien complet</li>
                        </ul>
                    </div>
                    
                    <!-- CTA button to join the meeting -->
                    <div style="text-align: center; margin: 40px 0 20px;">
                        <a href="${meetLink}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #eab308, #facc15); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(234, 179, 8, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                            <span style="display: inline-block; transition: transform 0.2s;">Rejoindre l'entretien</span>
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                        Le lien sera actif 10 minutes avant l'heure prévue
                    </p>
                </div>
            </div>
            
            <!-- Footer with calendar add option -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 15px;">Ajoutez cet entretien à votre calendrier</p>
                <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                    <a href="#" style="display: inline-block; padding: 8px 15px; background-color: #ffffff; color: #64748b; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e2e8f0;">
                        <span style="display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                <path d="M16.75 3.56V2C16.75 1.59 16.41 1.25 16 1.25C15.59 1.25 15.25 1.59 15.25 2V3.5H8.74999V2C8.74999 1.59 8.40999 1.25 7.99999 1.25C7.58999 1.25 7.24999 1.59 7.24999 2V3.56C4.54999 3.81 3.24999 5.42 3.24999 8.44V17.25C3.24999 20.7 4.99999 22 7.99999 22H16C19 22 20.75 20.7 20.75 17.25V8.44C20.75 5.42 19.45 3.81 16.75 3.56ZM7.99999 10.75C8.41999 10.75 8.74999 11.08 8.74999 11.5C8.74999 11.92 8.41999 12.25 7.99999 12.25C7.57999 12.25 7.24999 11.92 7.24999 11.5C7.24999 11.08 7.57999 10.75 7.99999 10.75ZM16 10.75C16.42 10.75 16.75 11.08 16.75 11.5C16.75 11.92 16.42 12.25 16 12.25C15.58 12.25 15.25 11.92 15.25 11.5C15.25 11.08 15.58 10.75 16 10.75ZM16 17.25H7.99999C7.57999 17.25 7.24999 16.92 7.24999 16.5C7.24999 16.08 7.57999 15.75 7.99999 15.75H16C16.42 15.75 16.75 16.08 16.75 16.5C16.75 16.92 16.42 17.25 16 17.25Z" fill="#64748b"/>
                            </svg>
                            Google
                        </span>
                    </a>
                    <a href="#" style="display: inline-block; padding: 8px 15px; background-color: #ffffff; color: #64748b; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e2e8f0;">
                        <span style="display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                <path d="M16.75 3.56V2C16.75 1.59 16.41 1.25 16 1.25C15.59 1.25 15.25 1.59 15.25 2V3.5H8.74999V2C8.74999 1.59 8.40999 1.25 7.99999 1.25C7.58999 1.25 7.24999 1.59 7.24999 2V3.56C4.54999 3.81 3.24999 5.42 3.24999 8.44V17.25C3.24999 20.7 4.99999 22 7.99999 22H16C19 22 20.75 20.7 20.75 17.25V8.44C20.75 5.42 19.45 3.81 16.75 3.56ZM7.99999 10.75C8.41999 10.75 8.74999 11.08 8.74999 11.5C8.74999 11.92 8.41999 12.25 7.99999 12.25C7.57999 12.25 7.24999 11.92 7.24999 11.5C7.24999 11.08 7.57999 10.75 7.99999 10.75ZM16 10.75C16.42 10.75 16.75 11.08 16.75 11.5C16.75 11.92 16.42 12.25 16 12.25C15.58 12.25 15.25 11.92 15.25 11.5C15.25 11.08 15.58 10.75 16 10.75ZM16 17.25H7.99999C7.57999 17.25 7.24999 16.92 7.24999 16.5C7.24999 16.08 7.57999 15.75 7.99999 15.75H16C16.42 15.75 16.75 16.08 16.75 16.5C16.75 16.92 16.42 17.25 16 17.25Z" fill="#64748b"/>
                            </svg>
                            Outlook
                        </span>
                    </a>
                    <a href="#" style="display: inline-block; padding: 8px 15px; background-color: #ffffff; color: #64748b; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e2e8f0;">
                        <span style="display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                <path d="M16.75 3.56V2C16.75 1.59 16.41 1.25 16 1.25C15.59 1.25 15.25 1.59 15.25 2V3.5H8.74999V2C8.74999 1.59 8.40999 1.25 7.99999 1.25C7.58999 1.25 7.24999 1.59 7.24999 2V3.56C4.54999 3.81 3.24999 5.42 3.24999 8.44V17.25C3.24999 20.7 4.99999 22 7.99999 22H16C19 22 20.75 20.7 20.75 17.25V8.44C20.75 5.42 19.45 3.81 16.75 3.56ZM7.99999 10.75C8.41999 10.75 8.74999 11.08 8.74999 11.5C8.74999 11.92 8.41999 12.25 7.99999 12.25C7.57999 12.25 7.24999 11.92 7.24999 11.5C7.24999 11.08 7.57999 10.75 7.99999 10.75ZM16 10.75C16.42 10.75 16.75 11.08 16.75 11.5C16.75 11.92 16.42 12.25 16 12.25C15.58 12.25 15.25 11.92 15.25 11.5C15.25 11.08 15.58 10.75 16 10.75ZM16 17.25H7.99999C7.57999 17.25 7.24999 16.92 7.24999 16.5C7.24999 16.08 7.57999 15.75 7.99999 15.75H16C16.42 15.75 16.75 16.08 16.75 16.5C16.75 16.92 16.42 17.25 16 17.25Z" fill="#64748b"/>
                            </svg>
                            Apple
                        </span>
                    </a>
                </div>
                <div style="margin-top: 20px;">
                    <p style="margin: 0;">L'équipe ATS Québec</p>
                    <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                        <a href="mailto:support@atsquebec.com" style="color: #ca8a04; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                        <a href="https://atsquebec.com" style="color: #ca8a04; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                    </p>
                </div>
            </div>
        </div>
    `,

    existingUserInvitation: (inviteeName, organisationName, inviterName, invitationLink, role) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Professional modern header -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%; top: 60px; left: 60px;"></div>
                
                <!-- Logo with subtle glow -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(5px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #dbeafe; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Invitation à Rejoindre</p>
            </div>
            
            <!-- Modern, clean body with invitation details -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <!-- Background decorative elements -->
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: absolute; width: 150px; height: 150px; background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 20px; right: -50px; opacity: 0.6;"></div>
                
                <!-- Content with team icon -->
                <div style="position: relative; z-index: 1;">
                    <div style="width: 70px; height: 70px; background-color: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.9699 14.44C18.3399 14.67 19.8499 14.43 20.9099 13.72C22.3199 12.78 22.3199 11.24 20.9099 10.3C19.8399 9.59001 18.3099 9.35 16.9399 9.59" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.03 14.44C5.66 14.67 4.15 14.43 3.09 13.72C1.68 12.78 1.68 11.24 3.09 10.3C4.16 9.59001 5.69 9.35 7.06 9.59" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.46997 11.91 9.46997C13.34 9.46997 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #1e40af; font-size: 28px; font-weight: 700; margin-bottom: 25px; text-align: center;">Invitation à Rejoindre ${organisationName}</h2>
                    
                    <!-- Personal greeting -->
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                        Bonjour <span style="font-weight: 700; color: #1e3a8a;">${inviteeName}</span>,
                    </p>
                    
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
                        <span style="font-weight: 600; color: #1e3a8a;">${inviterName}</span> vous a invité(e) à rejoindre l'organisation "<strong style="color: #2563eb;">${organisationName}</strong>" en tant que <span style="background: #eff6ff; padding: 3px 8px; border-radius: 4px; color: #1d4ed8; font-weight: 500;">${role}</span>.
                    </p>
                    
                    <!-- Organization info card -->
                    <div style="background: linear-gradient(to right, #eff6ff, #f8fafc); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                        <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px; font-weight: 600;">À propos de ${organisationName}</h3>
                        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 10px;">
                            Une plateforme innovante de recrutement et de gestion des talents, conçue pour simplifier les processus RH et optimiser l'expérience candidat.
                        </p>
                        <div style="display: flex; align-items: center; margin-top: 15px;">
                            <div style="background-color: #dbeafe; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <p style="color: #334155; font-size: 14px; margin: 0; font-weight: 500;">En rejoignant, vous aurez accès à toutes les fonctionnalités ${role}.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CTA button to join -->
                    <div style="text-align: center; margin: 40px 0 30px;">
                        <a href="${invitationLink}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                            <span style="display: inline-block; transition: transform 0.2s;">Accepter l'invitation</span>
                        </a>
                    </div>
                    
                    <!-- Time limit note -->
                    <div style="background-color: #eff6ff; padding: 15px 25px; border-radius: 50px; display: inline-flex; align-items: center; margin: 0 auto; text-align: center; width: fit-content;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <circle cx="12" cy="12" r="10" stroke="#93c5fd" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style="color: #1d4ed8; font-weight: 600; font-size: 14px;">Cette invitation expire dans 24 heures</span>
                    </div>
                </div>
            </div>
            
            <!-- Modern footer with social links -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    newUserInvitation: (inviteeEmail, organisationName, inviterName, invitationLink, role) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Vibrant welcome header -->
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 30px; height: 30px; background: rgba(255,255,255,0.15); border-radius: 50%; top: 60px; left: 50px;"></div>
                <div style="position: absolute; width: 20px; height: 20px; background: rgba(255,255,255,0.15); border-radius: 50%; bottom: 50px; right: 80px;"></div>
                
                <!-- Animated welcome icon over logo -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(6px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                    <div style="position: absolute; top: -5px; right: -5px; background-color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" fill="#22c55e"/>
                            <path d="M16.9699 14.44C18.3399 14.67 19.8499 14.43 20.9099 13.72C22.3199 12.78 22.3199 11.24 20.9099 10.3C19.8399 9.59001 18.3099 9.35 16.9399 9.59" fill="#22c55e"/>
                            <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" fill="#22c55e"/>
                            <path d="M7.03 14.44C5.66 14.67 4.15 14.43 3.09 13.72C1.68 12.78 1.68 11.24 3.09 10.3C4.16 9.59001 5.69 9.35 7.06 9.59" fill="#22c55e"/>
                            <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.46997 11.91 9.46997C13.34 9.46997 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" fill="#22c55e"/>
                            <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" fill="#22c55e"/>
                        </svg>
                    </div>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #dcfce7; font-size: 18px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Une Nouvelle Aventure Commence</p>
            </div>
            
            <!-- Fresh, welcoming body content -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <!-- Background decorative elements -->
                <div style="position: absolute; width: 200px; height: 200px; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-radius: 50%; z-index: 0; top: 50px; left: -100px; opacity: 0.6;"></div>
                <div style="position: absolute; width: 150px; height: 150px; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-radius: 50%; z-index: 0; bottom: 20px; right: -50px; opacity: 0.6;"></div>
                
                <!-- Content with welcome message -->
                <div style="position: relative; z-index: 1;">
                    <h2 style="color: #166534; font-size: 28px; font-weight: 700; margin-bottom: 25px; text-align: center;">Bienvenue chez ${organisationName}</h2>
                    
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
                        Bonjour,
                    </p>
                    
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
                        <span style="font-weight: 600; color: #166534;">${inviterName}</span> vous invite à créer un compte et à rejoindre "<strong style="color: #22c55e;">${organisationName}</strong>" en tant que <span style="background: #f0fdf4; padding: 3px 8px; border-radius: 4px; color: #166534; font-weight: 500;">${role}</span>.
                    </p>
                    
                    <!-- Email notification -->
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 15px; margin-bottom: 30px; display: flex; align-items: center;">
                        <div style="background-color: #f0fdf4; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" stroke="#16a34a" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="#16a34a" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p style="color: #4b5563; font-size: 14px; margin: 0; font-weight: 500;">
                            Cette invitation a été envoyée à <span style="color: #16a34a; font-weight: 600;">${inviteeEmail}</span>
                        </p>
                    </div>
                    
                    <!-- Feature highlights -->
                    <div style="background: linear-gradient(to right, #f0fdf4, #f8fafc); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #22c55e;">
                        <h3 style="color: #166534; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Ce qui vous attend</h3>
                        
                        <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                            <div style="min-width: 24px; height: 24px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12L10 17L19 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Une plateforme intuitive de gestion des talents</p>
                        </div>
                        
                        <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                            <div style="min-width: 24px; height: 24px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12L10 17L19 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Des outils avancés pour optimiser vos processus RH</p>
                        </div>
                        
                        <div style="display: flex; align-items: flex-start;">
                            <div style="min-width: 24px; height: 24px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12L10 17L19 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Une collaboration efficace avec votre équipe</p>
                        </div>
                    </div>
                    
                    <!-- CTA button to create account -->
                    <div style="text-align: center; margin: 40px 0 30px;">
                        <a href="${invitationLink}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #22c55e, #16a34a); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(34, 197, 94, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                            <span style="display: inline-block; transition: transform 0.2s;">Créer mon compte</span>
                        </a>
                    </div>
                    
                    <!-- Time limit note -->
                    <div style="background-color: #f0fdf4; padding: 15px 25px; border-radius: 50px; display: inline-flex; align-items: center; margin: 0 auto; text-align: center; width: fit-content;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <circle cx="12" cy="12" r="10" stroke="#86efac" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style="color: #166534; font-weight: 600; font-size: 14px;">Cette invitation expire dans 24 heures</span>
                    </div>
                </div>
            </div>
            
            <!-- Modern footer with social links -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                    <a href="https://twitter.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="Twitter" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://linkedin.com/company/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                    </a>
                    <a href="https://facebook.com/atsquebec" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <p style="margin: 0;">L'équipe ATS Québec</p>
                <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                    <a href="mailto:support@atsquebec.com" style="color: #22c55e; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                    <a href="https://atsquebec.com" style="color: #22c55e; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                </p>
            </div>
        </div>
    `,

    recruitmentProcess: (candidatName, offreTitre, processType, description, url, duree) => `
        <div style="font-family: 'Poppins', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
            <!-- Engaging gradient header -->
            <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 50px 20px; text-align: center; position: relative;">
                <!-- Decorative elements -->
                <div style="position: absolute; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; right: -50px;"></div>
                <div style="position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; bottom: -30px; left: 30px;"></div>
                <div style="position: absolute; width: 30px; height: 30px; background: rgba(255,255,255,0.15); border-radius: 50%; top: 60px; left: 60px;"></div>
                
                <!-- Process type indicator -->
                <div style="position: absolute; top: 20px; right: 20px; background-color: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 30px; backdrop-filter: blur(5px);">
                    <span style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">${processType}</span>
                </div>
                
                <!-- Logo with glow effect -->
                <div style="position: relative; display: inline-block;">
                    <div style="position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; background: rgba(167, 139, 250, 0.3); border-radius: 50%; filter: blur(10px);"></div>
                    <img src="${LOGO_ATS}" alt="ATS Logo" style="position: relative; width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ATS Québec</h1>
                <p style="color: #e0e7ff; font-size: 16px; margin: 12px 0 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Processus de Recrutement</p>
            </div>
            
            <!-- Modern, clean body -->
            <div style="padding: 50px 40px; background-color: #ffffff; text-align: left; position: relative;">
                <div style="position: relative; z-index: 1;">
                    <div style="width: 70px; height: 70px; background-color: #eef2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill  margin: 0 auto 30px;">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 2V5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.5 9.09H20.5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.6947 13.7H15.7037" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.6947 16.7H15.7037" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9955 13.7H12.0045" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9955 16.7H12.0045" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.29431 13.7H8.30329" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.29431 16.7H8.30329" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 style="color: #312e81; font-size: 28px; font-weight: 700; margin-bottom: 20px; text-align: center;">Processus de Recrutement - ${processType}</h2>
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                        Bonjour <span style="background: linear-gradient(to right, #4f46e5, #6366f1); -webkit-background-clip: text; color: transparent; font-weight: 700;">${candidatName}</span>,
                    </p>
                    <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                        Nous sommes heureux de vous informer que le processus de recrutement pour l'offre "<strong style="color: #4f46e5;">${offreTitre}</strong>" a démarré. Voici les détails de cette étape importante dans votre parcours.
                    </p>
                    
                    <!-- Process details card -->
                    <div style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 30px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <!-- Card header -->
                        <div style="background-color: #eef2ff; padding: 20px; text-align: center; border-bottom: 1px solid #e0e7ff;">
                            <h3 style="color: #4338ca; font-size: 18px; margin: 0; font-weight: 600;">Détails du Processus</h3>
                        </div>
                        
                        <!-- Card body -->
                        <div style="padding: 30px;">
                            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 8V13" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M11.9945 16H12.0035" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Type de processus</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 600;">${processType}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 2V5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M16 2V5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M3.5 9.09H20.5" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#4f46e5" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Durée estimée</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 600;">${duree} minutes</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start;">
                                <div style="min-width: 24px; margin-right: 15px; margin-top: 3px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 13H13" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 17H11" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 5px; font-weight: 500;">Description</p>
                                    <p style="color: #1e293b; font-size: 16px; margin: 0; font-weight: 400; line-height: 1.6;">${description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Instructions card -->
                    <div style="background: linear-gradient(to right, #eef2ff, #f8fafc); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #4f46e5;">
                        <h3 style="color: #312e81; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Comment se préparer</h3>
                        <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                            <div style="min-width: 24px; height: 24px; background-color: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <span style="color: #4338ca; font-weight: 600; font-size: 12px;">1</span>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Préparez un environnement calme et sans distractions</p>
                        </div>
                        <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                            <div style="min-width: 24px; height: 24px; background-color: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <span style="color: #4338ca; font-weight: 600; font-size: 12px;">2</span>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Assurez-vous que votre connexion internet est stable</p>
                        </div>
                        <div style="display: flex; align-items: flex-start;">
                            <div style="min-width: 24px; height: 24px; background-color: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;">
                                <span style="color: #4338ca; font-weight: 600; font-size: 12px;">3</span>
                            </div>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Prenez votre temps et lisez attentivement toutes les instructions</p>
                        </div>
                    </div>
                    
                    ${
                        url ? `
                        <!-- CTA button to start process -->
                        <div style="text-align: center; margin: 40px 0 20px;">
                            <a href="${url}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #4f46e5, #6366f1); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 15px rgba(79, 70, 229, 0.3); transition: transform 0.3s, box-shadow 0.3s;">
                                <span style="display: inline-block; transition: transform 0.2s;">Commencer maintenant</span>
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                            Cliquez sur le bouton ci-dessus pour commencer le processus
                        </p>
                        ` : `
                        <!-- Notification when no URL -->
                        <div style="background-color: #eef2ff; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                            <p style="color: #4338ca; font-size: 16px; font-weight: 600; margin: 0;">
                                Un membre de notre équipe vous contactera prochainement avec les instructions pour cette étape.
                            </p>
                        </div>
                        `
                    }
                </div>
            </div>
            
            <!-- Footer with contact info -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 15px; font-weight: 500;">Des questions sur le processus ?</p>
                <a href="mailto:support@atsquebec.com" style="display: inline-block; padding: 10px 20px; background-color: #ffffff; color: #4f46e5; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e0e7ff; margin-bottom: 20px;">
                    Contactez notre équipe
                </a>
                <div style="margin-top: 20px;">
                    <p style="margin: 0;">L'équipe ATS Québec</p>
                    <p style="margin: 8px 0 0; display: flex; justify-content: center; align-items: center;">
                        <a href="mailto:support@atsquebec.com" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">support@atsquebec.com</a> | 
                        <a href="https://atsquebec.com" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">atsquebec.com</a>
                    </p>
                </div>
            </div>
        </div>
    `,

    supportClientToAdmin: ( sujet, contenu, emailSource) => `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
        <div style="background: linear-gradient(135deg, #6b7280, #9ca3af); padding: 40px 20px; text-align: center;">
            <img src="${LOGO_ATS}" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
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
            <img src="${LOGO_ATS}" alt="ATS Logo" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
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
            htmlContent = templates.supportClientToAdmin(data.sujet, data.contenu, data.emailSource);
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