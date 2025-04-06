const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const { fermerOffresExpirees } = require('./offre.job');
const { fermerProcessusExpirees } = require('./processus.job');

const prisma = new PrismaClient();

cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Lancement de la fermeture des offres expirées...`);
    await fermerOffresExpirees(prisma);
});

// cron.schedule('* * * * *', async () => {
//     console.log(`[${new Date().toISOString()}] Lancement de la mise à jour des processus...`);
//     await fermerProcessusExpirees(prisma);
// });

console.log('Tous les cron jobs sont démarrés.');
