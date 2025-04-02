const { TypeProcessus, StatutProcessus, Status } = require("@prisma/client");
const prisma = require("../../src/config/prisma.config");

async function seedProcessus() {
    try {
        const offres = await prisma.offre.findMany({ select: { id: true } });
        if (offres.length === 0) {
            console.error("❌ Aucune offre trouvée. Exécutez d'abord seedOffres.");
            return;
        }

        console.log("🚀 Ajout des processus aux offres...");
        
        for (const offre of offres) {
            // Processus 1 : Tâche
            await prisma.processus.create({
                data: {
                    type: TypeProcessus.TACHE,
                    titre: "Tâche technique",
                    description: "Réaliser une tâche technique pour évaluer vos compétences.",
                    statut: StatutProcessus.A_VENIR,
                    duree: 3600,
                    ordre: 1,
                    offre_id: offre.id,
                },
            });
            
            // Processus 2 : Questionnaire
            const questionnaire = await prisma.processus.create({
                data: {
                    type: TypeProcessus.QUESTIONNAIRE,
                    titre: "Quizz test",
                    description: "Répondez à ce test pour évaluer vos connaissances.",
                    statut: StatutProcessus.A_VENIR,
                    duree: 120,
                    ordre: 2,
                    offre_id: offre.id,
                },
            });
            
            // Ajout des questions et réponses
            const questionsData = [
                {
                    question: "Quelle est la capitale de la France ?",
                    reponses: [
                        { texte: "Paris", est_correcte: true },
                        { texte: "Londres", est_correcte: false },
                    ],
                },
                {
                    question: "Quel langage est utilisé avec Laravel ?",
                    reponses: [
                        { texte: "PHP", est_correcte: true },
                        { texte: "Python", est_correcte: false },
                    ],
                },
            ];

            let ordre = 1; // Initialisation du compteur d'ordre pour les questions

            for (const { question, reponses } of questionsData) {
                const createdQuestion = await prisma.question.create({
                    data: {
                        label: question,
                        processus_id: questionnaire.id,
                        ordre,
                    },
                });
                
                await prisma.reponse.createMany({
                    data: reponses.map(reponse => ({
                        label: reponse.texte,
                        is_true: reponse.est_correcte,
                        question_id: createdQuestion.id,
                    })),
                });
                
                ordre++; // Incrémente l'ordre pour la prochaine question
            }
            
            // Processus 3 : Visio-conférence
            await prisma.processus.create({
                data: {
                    type: TypeProcessus.VISIO_CONFERENCE,
                    titre: "Visioconférence avec RH",
                    description: "Entretien en visioconférence avec notre équipe.",
                    statut: StatutProcessus.A_VENIR,
                    duree: 30,
                    ordre: 3,
                    offre_id: offre.id,
                },
            });
 
            // publish offre 
            await prisma.offre.update({
                where: {
                    id: offre.id,
                },
                data: {
                    status: Status.OUVERT
                }
            })
            
        }

        console.log("✅ Processus ajoutés avec succès !");
    } catch (error) {
        console.error("❌ Erreur dans seedProcessus:", error);
    }
}

module.exports = seedProcessus;
