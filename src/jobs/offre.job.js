const { PrismaClient, Status } = require('@prisma/client');

const prisma = new PrismaClient();

async function fermerOffresExpirees() {
    try {
        const maintenant = new Date();
        
        const offresExpirees = await prisma.offre.findMany({
            where: {
                status: Status.OUVERT, 
                date_limite: { lt: maintenant } 
            }
        });

        if (offresExpirees.length > 0) {
            await prisma.offre.updateMany({
                where: {
                    id: { in: offresExpirees.map(o => o.id) }
                },
                data: { status: Status.FERME }
            });

            console.log(`[${new Date().toISOString()}] ${offresExpirees.length} offre(s) fermée(s).`);
        } else {
            console.log(`[${new Date().toISOString()}] Aucune offre expirée.`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Erreur lors de la mise à jour des offres :`, error);
    }
}

module.exports = {  fermerOffresExpirees}