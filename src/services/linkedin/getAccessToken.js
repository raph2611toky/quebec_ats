import axios from 'axios';
import dotenv from 'dotenv';
import open from 'open';
import readline from 'readline';

dotenv.config();

const LINKEDIN_CLIENT_ID = "776zkki11lijn5";
const LINKEDIN_CLIENT_SECRET = "WPL_AP1.VSjbN0M2hQVXhX3J.fEbwKA==";
const LINKEDIN_REDIRECT_URI = "http://localhost:5000/send-code/change-token";
let LINKEDIN_ACCESS_TOKEN;

// Générer l'URL d'autorisation LinkedIn
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=openid%20profile%20email%20w_member_social`;




console.log("Ouvre ce lien dans ton navigateur et autorise l'accès :\n", authUrl);
open(authUrl); 

// Lire le code de l'utilisateur dans la console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Colle ici le code obtenu après autorisation : ", async (code) => {
    try {
        const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: LINKEDIN_REDIRECT_URI,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log(response.data)
        
        LINKEDIN_ACCESS_TOKEN = response.data.access_token;
        console.log("\nVoici ton access token :\n", LINKEDIN_ACCESS_TOKEN);
    } catch (error) {
        console.error("Erreur lors de la récupération du token d'accès :", error.response?.data || error.message);
    }
    rl.close();
});