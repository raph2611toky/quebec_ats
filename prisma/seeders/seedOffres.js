const prisma = require("../../src/config/prisma.config");
const Offre = require("../../src/models/offre.model");

async function seedOffres() {
    try {
        const userIds = (await prisma.user.findMany({
            select: { id: true }
        })).map(user => user.id);


        const organisationIds = (await prisma.organisation.findMany({
            select: { id: true }
        })).map(org => org.id);


        if (userIds.length === 0) {
            console.error("❌ Aucun utilisateur trouvé. Assurez-vous d'avoir exécuté le seed des utilisateurs.");
            return;
        }
        if (organisationIds.length === 0) {
            console.error("❌ Aucune organisation trouvée. Assurez-vous d'avoir exécuté le seed des organisations.");
            return;
        }


        const offresData = [
            { 
                titre: "Développeur Full Stack", 
                description: "Poste de développeur Full Stack...", 
                date_limite: "2025-04-30T23:59:59Z",
                nombre_requis: 3,
                lieu: "Paris",
                pays: "France",
                type_emploi: "CDD",
                salaire: "60000",
                devise: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
                user_id: userIds[Math.floor(Math.random() * userIds.length)],
                organisation_id: organisationIds[Math.floor(Math.random() * organisationIds.length)],
                status: "CREE"
            },
            { 
                titre: "Développeur front end NextJs", 
                description: "Poste de développeur NextJs...", 
                date_limite: "2025-05-30T23:59:59Z",
                nombre_requis: 2,
                lieu: "Paris",
                pays: "France",
                type_emploi: "CDI",
                salaire: "50000",
                devise: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
                user_id: userIds[Math.floor(Math.random() * userIds.length)],
                organisation_id: organisationIds[Math.floor(Math.random() * organisationIds.length)],
                status: "CREE"
            },
            { 
                titre: "Développeur backend Django", 
                description: "Poste de développeur Django...", 
                date_limite: "2025-05-15T23:59:59Z",
                nombre_requis: 1,
                lieu: "Paris",
                pays: "France",
                type_emploi: "CDD",
                salaire: "40000",
                devise: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
                user_id: userIds[Math.floor(Math.random() * userIds.length)],
                organisation_id: organisationIds[Math.floor(Math.random() * organisationIds.length)],
                status: "CREE"
            },
            { 
                titre: "Développeur Full Stack Laravel", 
                description: "Poste de développeur Laravel...", 
                date_limite: "2025-05-20T23:59:59Z",
                nombre_requis: 1,
                lieu: "Paris",
                pays: "France",
                type_emploi: "CDI",
                salaire: "90000",
                devise: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
                user_id: userIds[Math.floor(Math.random() * userIds.length)],
                organisation_id: organisationIds[Math.floor(Math.random() * organisationIds.length)],
                status: "CREE"
            }

        ];

        console.log("Création des offres...");

        // Création des offres avec Prisma
        const createdOffres = await Promise.all(
            offresData.map(offre =>
                Offre.create(offre)
            )
        );

        console.log("Offres créées avec succès !");

    } catch (error) {
        console.error("Erreur dans seedOffres:", error);
    }
}

module.exports = seedOffres;
