const seedUsers = require("./seedUsers"); 
const seedOrganisations = require("./seedOrganisations");
const seedOffres = require("./seedOffres"); 
const seedProcessus = require("./seedProcessus"); 

async function main() {
    try {
        console.log("Démarrage des seeders...");
        
        // Exécution du seeder des utilisateurs
        await seedUsers();
        
        // Exécution du seeder des organisations
        await seedOrganisations();
        
        // Exécution du seeder des offres
        await seedOffres();
        
        // Exécution du seeder des offres
        await seedProcessus();

        console.log("Les seeders ont été exécutés avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'exécution des seeders:", error);
    }
}

main();
