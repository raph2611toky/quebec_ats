const { Status } = require("@prisma/client");
const prisma = require("../../src/config/prisma.config");
const faker = require("faker");
const Candidat = require("../../src/models/candidat.model");


async function seedCandidatsPostulations() {
    console.log("Seed candidats postulation start ...");
    
    // check if exist offre publié
    const offresId = await prisma.offre.findMany({ 
        select: { id: true },
        where: { status: Status.OUVERT } 
    });

    if (offresId.length === 0) {
        console.error("❌ Aucune offre Publié trouvé pour postuler. Exécutez d'abord seedOffres.");
        return;
    }


    // Générer des candidats fictifs
    console.log("Seed Candidat");
    const candidatsDataList = Array.from({ length: 5 }, () => ({
        nom: faker.name.findName(),
        email: faker.internet.email(),
        is_email_active: true,
        telephone: faker.phone.phoneNumber(),
    }));


    let candidatsId =[]
    for (const candidatData of candidatsDataList) {
        const candidat = await Candidat.create(candidatData);
        candidatsId.push(candidat.id)
    }

    console.log("Candidats créés avec succès !");
    
    // seed postulation each candidat 
    console.log("Seed Postulation");
    
    for (const candidat_id of candidatsId) {
        const randomOffre = offresId[Math.floor(Math.random() * offresId.length)].id;
        await prisma.postulation.create({
            data: {
                candidat_id,
                offre_id: randomOffre,
                cv: "https://test.com/url-vers-cv",
                lettre_motivation: "https://test.com/url-vers-lm",
            }
        });
    }
    
    console.log("Postulations créés avec succès !");


    console.log("Seed candidats postulation succès !");

}



module.exports = seedCandidatsPostulations