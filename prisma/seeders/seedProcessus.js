const { TypeProcessus, StatutProcessus, Status } = require("@prisma/client");
const prisma = require("../../src/config/prisma.config");

async function seedProcessus() {
    try {
        const offres = await prisma.offre.findMany({ 
            select: { 
                id: true ,
                date_limite: true
            } });
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
                    offre_id: offre.id,
                },
            });
            
            // Processus 2 : Questionnaire
            const questionnaire = await prisma.processus.create({
                data: {
                    type: TypeProcessus.QUESTIONNAIRE,
                    titre: "Quizz test",
                    description: "Répondez à ce test pour évaluer vos connaissances.",
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


            for (const { question, reponses } of questionsData) {
                const createdQuestion = await prisma.question.create({
                    data: {
                        label: question,
                        processus_id: questionnaire.id,
                    },
                });
                
                await prisma.reponse.createMany({
                    data: reponses.map(reponse => ({
                        label: reponse.texte,
                        is_true: reponse.est_correcte,
                        question_id: createdQuestion.id,
                    })),
                });
                
            }
            
 
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
