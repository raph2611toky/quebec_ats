const { Role } = require("@prisma/client");
const prisma = require("../../src/config/prisma.config");

async function seedOrganisations() {
    try {
        const organisationsData = [
            { nom: "Organisation 1", adresse: "Adresse 1", ville: "Ville 1" },
            { nom: "Organisation 2", adresse: "Adresse 2", ville: "Ville 2" },
            { nom: "Organisation 3", adresse: "Adresse 3", ville: "Ville 3" },
            { nom: "Organisation 4", adresse: "Adresse 4", ville: "Ville 4" },
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
