const { Role } = require("@prisma/client");
const prisma = require("../../src/config/prisma.config");

async function seedOffres() {
    try {
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
                currency: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
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
                currency: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
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
                currency: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
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
                currency: "EURO",
                horaire_ouverture: "08:00:00",
                horaire_fermeture: "18:00:00",
            }

        ];

        console.log("Création des organisations...");

        // Création des organisations avec Prisma
        const createdOrganisations = await Promise.all(
            organisationsData.map(org =>
                prisma.organisation.create({
                    data: org
                })
            )
        );

        console.log("Organisations créées avec succès !");

        // Récupération des utilisateurs existants
        const users = await prisma.user.findMany();
        if (!users.length) {
            console.warn("Aucun utilisateur trouvé. Impossible d'attribuer les rôles.");
            return;
        }

        // Séparation des rôles
        const admins = users.filter(user => user.role === Role.ADMINISTRATEUR);
        const moderators = users.filter(user => user.role === Role.MODERATEUR);

        // Association des admins à toutes les organisations
        for (const admin of admins) {
            await Promise.all(
                createdOrganisations.map(org =>
                    prisma.organisation.update({
                        where: { id: org.id },
                        data: {
                            users: {
                                connect: { id: admin.id }
                            }
                        }
                    })
                )
            );
        }

        // Association des modérateurs uniquement à la première organisation
        if (createdOrganisations.length > 0) {
            for (const moderator of moderators) {
                await prisma.organisation.update({
                    where: { id: createdOrganisations[0].id },
                    data: {
                        users: {
                            connect: { id: moderator.id }
                        }
                    }
                });
            }
        }

        console.log("Associations utilisateurs-organisations effectuées avec succès !");
    } catch (error) {
        console.error("Erreur dans seedOrganisations:", error);
    }
}

module.exports = seedOrganisations;
