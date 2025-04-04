const { PrismaClient, StatutProcessus } = require("@prisma/client");

const prisma = new PrismaClient();


async function fermerProcessusExpirees() {
    console.log("Vérification des processus à fermer...");

    try {
        const now = new Date();

        const processusToClose = await prisma.processus.findMany({
            where: {
                statut: StatutProcessus.EN_COURS, 
                start_at: { lte: now }, 
            },
        });

        for (const processus of processusToClose) {

            const endTime = new Date(processus.start_at);
            endTime.setMinutes(endTime.getMinutes() + processus.duree);

            if (now >= endTime) {
                await prisma.processus.update({
                    where: { id: processus.id },
                    data: { statut: StatutProcessus.TERMINER },
                });
                console.log(`Processus ${processus.id} fermé.`);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la fermeture des processus :", error);
    }
}

module.exports = { fermerProcessusExpirees }
