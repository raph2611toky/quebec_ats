const app = require("./app.js");

// Définition du port
const PORT = process.env.PORT || 3000;

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${PORT}/api/docs`);
});