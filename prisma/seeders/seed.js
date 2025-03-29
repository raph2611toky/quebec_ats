const seedUsers = require("./seedUsers"); // Assurez-vous que le chemin est correct
const seedOrganisations = require("./seedOrganisations"); // Assurez-vous que le chemin est correct

async function main() {
    try {
        console.log("Démarrage des seeders...");
        
        // Exécution du seeder des utilisateurs
        await seedUsers();
        
        // Exécution du seeder des organisations
        await seedOrganisations();
        
        console.log("Les seeders ont été exécutés avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'exécution des seeders:", error);
    }
}

main();
