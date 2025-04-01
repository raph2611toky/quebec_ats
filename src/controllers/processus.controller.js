require("dotenv").config()
const { StatutProcessus, TypeProcessus, Status, StatutProcessusPasser } = require("@prisma/client");
const Processus = require("../models/processus.model");
const Question = require("../models/question.model");
const Offre = require("../models/offre.model");
const createGoogleMeet = require("../services/meet/googleMeet.services.js");
const { generateToken } = require("../utils/securite/jwt.js")
const { encryptAES } = require("../utils/securite/cryptographie.js")
const prisma = require("../config/prisma.config");
const { existingType, sendEmail } = require("../services/notifications/email")
const fs = require("fs").promises;
const cloudinary = require("../config/cloudinary.config.js")


exports.createProcessus = async (req, res) => {
    try {
        const processusData = {
            ...req.body,
            offre_id : parseInt(req.body.offre_id),
            duree: parseInt(req.body.duree)
        };
  
        const offre = await Offre.getById(processusData.offre_id)
        if(offre.status != Status.CREE){
            return res.status(401).json({ error: "Non autorisé. L'offre est déjà publier." });
        }

        const newProcessus = await Processus.create(processusData);
        return res.status(201).json(newProcessus);
    } catch (error) {
        console.error("Erreur lors de la création du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateProcessus = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);
        const existingProcessus = await Processus.getById(processusId);

        if (!existingProcessus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        const offre = await Offre.getById(existingProcessus.offre_id)
        if(offre.status != Status.CREE){
            return res.status(401).json({ error: "Non autorisé. L'offre est déjà publier." });
        }


        if (existingProcessus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ error: "Processus qui a déjà commencé, ne peut plus être modifié" });
        }

        // Récupérer uniquement les champs valides présents dans la requête
        const { titre, type, description, duree } = req.body;
        let updateData = {};

        if (titre !== undefined) updateData.titre = titre;
        if (type !== undefined) updateData.type = type;
        if (description !== undefined) updateData.description = description;
        if (duree !== undefined) {
            const parsedDuree = parseInt(duree);
            if (!isNaN(parsedDuree)) updateData.duree = parsedDuree;
        }

        // Si aucun champ valide n'est fourni
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Aucune donnée valide fournie pour la mise à jour" });
        }

        const updatedProcessus = await Processus.update(processusId, updateData);
        return res.status(200).json(updatedProcessus);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteProcessus = async (req, res) => {
    try {
        const processus = await Processus.getById(parseInt(req.params.id));
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        const offre = await Offre.getById(processus.offre_id)
        if(offre.status != Status.CREE){
            return res.status(401).json({ error: "Non autorisé. L'offre est déjà publier." });
        }

        if(processus.statut == StatutProcessus.EN_COURS){
            return res.status(400).json({ error: "Processus en cours, ne peux pas être supprimer" });
        }
        await Processus.delete(parseInt(req.params.id));
        return res.status(200).json({ message: "Processus supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getProcessus = async (req, res) => {
    try {
        const processus = await Processus.getById(parseInt(req.params.id));
        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }
        return res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération du processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllProcessus = async (req, res) => {
    try {
        const processus = await Processus.getAll();
        return res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération des processus:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.addQuizzJson = async (req, res) => {
    try {
        const processusId = parseInt(req.params.id);
        const processus = await Processus.getById(processusId);

        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }
        
        if (processus.type !== TypeProcessus.QUESTIONNAIRE) {
            return res.status(400).json({ 
                error: "Impossible d'ajouter un quiz : le processus doit être de type QUESTIONNAIRE" 
            });
        }
        
        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ 
                error: "Impossible d'ajouter un quiz : le processus a déjà commencé ou est terminé" 
            });
        }

        const quizzData = req.body;
        if (!Array.isArray(quizzData) || quizzData.length === 0) {
            return res.status(400).json({ 
                error: "Le fichier JSON doit contenir un tableau non vide de questions" 
            });
        }
        const existingQuestionsCount = await prisma.question.count({
            where: { processus_id: processusId }
        });
        const createdQuestions = [];
            for (let i = 0; i < quizzData.length; i++) {
                const questionData = quizzData[i];
                
                if (!questionData.label || !Array.isArray(questionData.reponses) || questionData.reponses.length === 0) {
                    return res.status(400).json({ 
                        error: "Chaque question doit avoir un label et au moins une réponse" 
                    });
                }

                const ordre = existingQuestionsCount + i + 1;

                const newQuestion = await prisma.question.create({
                    data: {
                        label: questionData.label,
                        ordre: ordre,
                        processus: { connect: { id: processusId } },
                        reponses: {
                            create: questionData.reponses.map(reponse => ({
                                label: reponse.label,
                                is_true: !!reponse.is_true
                            }))
                        }
                    },
                    include: { reponses: true }
                });
                
                createdQuestions.push(newQuestion);
            }

        return res.status(201).json({
            message: "Quiz ajouté avec succès",
            questions: createdQuestions
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du quiz JSON:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.startProcessus = async (req, res) => {
    try {
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { offre: true }
        });

        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        if (processus.offre.status === Status.OUVERT) {
            return res.status(400).json({ error: "Offre encore ouverte (reçoit des candidatures)." });
        } else if (processus.offre.status === Status.CREE) {
            return res.status(400).json({ error: "Offre non encore publiée." });
        }

        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ error: "Processus déjà en cours ou terminé." });
        }

        const processusEnCours = await prisma.processus.findFirst({
            where: { offre_id: processus.offre.id, statut: StatutProcessus.EN_COURS }
        });

        if (processusEnCours) {
            return res.status(400).json({ error: "Un processus est déjà en cours pour cette offre." });
        }

        await prisma.processus.update({
            where: { id: processus.id },
            data: { statut: StatutProcessus.EN_COURS }
        });

        const candidats = await prisma.candidat.findMany({
            where: { postulations: { some: { offre_id: processus.offre.id } } },
            include: { postulations: true }
        });

        const envoiNotifications = async (data, subject, processType) => {
            for (const candidat of candidats) {
                const token = generateToken({
                    candidat_id: candidat.id,
                    processus_id: encryptAES(processus.id)
                });
                
                const finalUrl = data.url ? `${data.url}${token}` : undefined;

                await sendEmail({
                    to: candidat.email,
                    subject,
                    type: existingType.recruitmentProcess,
                    data: {
                        candidatName: candidat.nom,
                        offreTitre: processus.offre.titre,
                        processType: processType,
                        description: data.description,
                        url: finalUrl,
                        duree: processus.duree
                    },
                    saveToNotifications: false
                });
            }
            console.log("Emails envoyés à tous les candidats");
        };

        if (processus.type === TypeProcessus.QUESTIONNAIRE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/quizz?token=`,
                    description: `${processus.titre} - Répondez aux questions dans le temps imparti`
                },
                "Processus de Recrutement - Questionnaire",
                "Questionnaire"
            );
        } else if (processus.type === TypeProcessus.TACHE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/tache?token=`,
                    description: `${processus.titre} - ${processus.description}`
                },
                "Processus de Recrutement - Tâche",
                "Tâche"
            );
        } else if (processus.type === TypeProcessus.VISIO_CONFERENCE) {
            await envoiNotifications(
                {
                    description: `${processus.titre} - Préparez-vous pour la visio-conférence`
                },
                "Processus de Recrutement - Visio-conférence",
                "Visio-conférence"
            );
        } else {
            return res.status(500).json({ error: "Type de processus invalide" });
        }

        return res.status(200).json({ 
            message: `Le processus "${processus.titre}" pour l'offre "${processus.offre.titre}" a démarré avec succès`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.startProcessusInacheve = async (req, res) => {
    try {
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { offre: true }
        });

        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        if (processus.offre.status === Status.OUVERT) {
            return res.status(400).json({ error: "Offre encore ouverte (reçoit des candidatures)." });
        } else if (processus.offre.status === Status.CREE) {
            return res.status(400).json({ error: "Offre non encore publiée." });
        }

        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ error: "Processus déjà en cours ou terminé." });
        }

        const processusEnCours = await prisma.processus.findFirst({
            where: { offre_id: processus.offre.id, statut: StatutProcessus.EN_COURS }
        });

        if (processusEnCours) {
            return res.status(400).json({ error: "Un processus est déjà en cours pour cette offre." });
        }

        await prisma.processus.update({
            where: { id: processus.id },
            data: { statut: StatutProcessus.EN_COURS }
        });

        const candidats = await prisma.candidat.findMany({
            where: {
                postulations: { some: { offre_id: processus.offre.id } },
                processus_candidats: { none: { processus_id: processus.id } }
            },
            include: { postulations: true }
        });

        const envoiNotifications = async (data, subject, processType) => {
            for (const candidat of candidats) {
                const token = generateToken({
                    candidat_id: candidat.id,
                    processus_id: encryptAES(processus.id)
                });
                
                const finalUrl = data.url ? `${data.url}${token}` : undefined;

                await sendEmail({
                    to: candidat.email,
                    subject,
                    type: existingType.recruitmentProcess,
                    data: {
                        candidatName: candidat.nom,
                        offreTitre: processus.offre.titre,
                        processType: processType,
                        description: data.description,
                        url: finalUrl,
                        duree: processus.duree
                    },
                    saveToNotifications: false
                });
            }
            console.log("Emails envoyés à tous les candidats");
        };

        if (processus.type === TypeProcessus.QUESTIONNAIRE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/quizz?token=`,
                    description: `${processus.titre} - Répondez aux questions dans le temps imparti`
                },
                "Processus de Recrutement - Questionnaire",
                "Questionnaire"
            );
        } else if (processus.type === TypeProcessus.TACHE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/tache?token=`,
                    description: `${processus.titre} - ${processus.description}`
                },
                "Processus de Recrutement - Tâche",
                "Tâche"
            );
        } else if (processus.type === TypeProcessus.VISIO_CONFERENCE) {
            await envoiNotifications(
                {
                    description: `${processus.titre} - Préparez-vous pour la visio-conférence`
                },
                "Processus de Recrutement - Visio-conférence",
                "Visio-conférence"
            );
        } else {
            return res.status(500).json({ error: "Type de processus invalide" });
        }

        return res.status(200).json({ 
            message: `Le processus "${processus.titre}" pour l'offre "${processus.offre.titre}" a démarré avec succès`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.startProcessusForCandidats = async (req, res) => {
    try {
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { offre: true }
        });

        if (!processus) {
            return res.status(404).json({ error: "Processus non trouvé" });
        }

        if (processus.offre.status === Status.OUVERT) {
            return res.status(400).json({ error: "Offre encore ouverte (reçoit des candidatures)." });
        } else if (processus.offre.status === Status.CREE) {
            return res.status(400).json({ error: "Offre non encore publiée." });
        }

        if (processus.statut !== StatutProcessus.A_VENIR) {
            return res.status(400).json({ error: "Processus déjà en cours ou terminé." });
        }

        const processusEnCours = await prisma.processus.findFirst({
            where: { offre_id: processus.offre.id, statut: StatutProcessus.EN_COURS }
        });

        if (processusEnCours) {
            return res.status(400).json({ error: "Un processus est déjà en cours pour cette offre." });
        }
        
        await prisma.processus.update({
            where: { id: processus.id },
            data: { statut: StatutProcessus.EN_COURS }
        });

        const candidatsIds = req.body.candidats;
        
        if (!Array.isArray(candidatsIds) || candidatsIds.length === 0) {
            return res.status(400).json({ error: "La liste des candidats est vide ou invalide" });
        }

        const candidats = await prisma.candidat.findMany({
            where: {
                id: { in: candidatsIds },
                postulations: { some: { offre_id: processus.offre.id } } 
            },
            include: { postulations: true }
        });

        if (candidats.length === 0) {
            return res.status(400).json({ error: "Aucun candidat valide trouvé" });
        }

        const envoiNotifications = async (data, subject, processType) => {
            for (const candidat of candidats) {
                const token = generateToken({
                    candidat_id: candidat.id,
                    processus_id: encryptAES(processus.id)
                });
                
                const finalUrl = data.url ? `${data.url}${token}` : undefined;

                await sendEmail({
                    to: candidat.email,
                    subject,
                    type: existingType.recruitmentProcess,
                    data: {
                        candidatName: candidat.nom,
                        offreTitre: processus.offre.titre,
                        processType: processType,
                        description: data.description,
                        url: finalUrl,
                        duree: processus.duree
                    },
                    saveToNotifications: false
                });
            }
            console.log("Emails envoyés aux candidats sélectionnés");
        };

        if (processus.type === TypeProcessus.QUESTIONNAIRE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/quizz?token=`,
                    description: `${processus.titre} - Répondez aux questions dans le temps imparti`
                },
                "Processus de Recrutement - Questionnaire",
                "Questionnaire"
            );
        } else if (processus.type === TypeProcessus.TACHE) {
            await envoiNotifications(
                {
                    url: `http://${process.env.FRONTEND_URL}/recruit/tache?token=`,
                    description: `${processus.titre} - ${processus.description}`
                },
                "Processus de Recrutement - Tâche",
                "Tâche"
            );
        } else if (processus.type === TypeProcessus.VISIO_CONFERENCE) {
            await envoiNotifications(
                {
                    description: `${processus.titre} - Préparez-vous pour la visio-conférence`
                },
                "Processus de Recrutement - Visio-conférence",
                "Visio-conférence"
            );
        } else {
            return res.status(500).json({ error: "Type de processus invalide" });
        }

        return res.status(200).json({ 
            message: `Le processus "${processus.titre}" pour l'offre "${processus.offre.titre}" a démarré pour les candidats sélectionnés`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.submitQuizz = async (req, res) => {
    try {
        const processus = await prisma.processus.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
            include: {
                questions : {
                    include: {
                        reponses: true
                    }
                }
            }
        })
        
        if(!processus){
            return res.status(404).json({ error: "Processus non trouver." });
        }
        
        if(processus.type != TypeProcessus.QUESTIONNAIRE){
            return res.status(400).json({ error: "Le processus doit être type questionnaire." });
        }
        
        if(processus.statut != StatutProcessus.EN_COURS){
            return res.status(400).json({ error: "Le processus n'est pas en cours." });
        }

        const reponses = req.body 
        if (!Array.isArray(reponses) || reponses.length === 0) {
            return res.status(400).json({ error: "Aucune réponse fournie." });
        }

        const nombre_total_question = processus.questions.length
        let score = 0

        for (const { questionId, reponseId } of reponses) {
            const question = processus.questions.find(q => q.id === questionId);
            if (question) {
                const bonneReponse = question.reponses.find(r => r.is_true);
                if (bonneReponse && bonneReponse.id === reponseId) {
                    score++;
                }
            }
        }
        
        const postulation = await prisma.postulation.findUnique({
            where: {
                offre_id: processus.offre_id,
                candidat_id: req.candidat.id
            }
        })
        
        if(!postulation){
            return res.status(400).json({ error: "Candidature à l'offre introuvable ." });
        }


        // create processus passer 
        await prisma.processusPasser.create(
            {
                data: 
                {
                    processus_id : processus.id,
                    postulation_id : postulation.id,
                    statut: StatutProcessusPasser.TERMINER,
                    score,
                    lien_web: null,
                    lien_fichier: null, 
                    lien_vision: null
                }
            }
        )

        await prisma.postulation.update({
            where: {
                id: postulation.id
            },
            data: {
                note: postulation.note + score 
            }
        })

        return res.status(200).json({
            score, nombre_total_question
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.submitTache = async (req, res)=>{
    try {
        const processus = await prisma.processus.findUnique({
            where: {
                id: parseInt(req.params.id),
            }
        })
        
        if(!processus){
            return res.status(404).json({ error: "Processus non trouver." });
        }
        
        if(processus.type != TypeProcessus.TACHE){
            return res.status(400).json({ error: "Le processus doit être type tache." });
        }
        
        if(processus.statut != StatutProcessus.EN_COURS){
            return res.status(400).json({ error: "Le processus n'est pas en cours." });
        }
        
        let lien_fichier=null;
        if (req.file?.path) {
            try {
                await fs.access(req.file.path);
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "taches",
                    use_filename: true,
                    unique_filename: false
                });
                lien_fichier = result.secure_url;
            } catch (error) {
                console.error("Le fichier n'a pas été correctement transféré:", error);
                return res.status(400).json({ error: "Erreur lors du transfert du fichier de validation tâche" });
            }

        } 


        let lien_web = req.body?.lien || null 

        if(!lien_fichier && !lien_web){
            return res.status(400).json({message: "fichier ou lien est requis pour envoyer votre travaille sur la tâche : "+ processus.titre})
        }

        const postulation = await prisma.postulation.findUnique({
            where: {
                offre_id: processus.offre_id,
                candidat_id: req.candidat.id
            }
        })
        
        if(!postulation){
            return res.status(400).json({ error: "Candidature à l'offre introuvable ." });
        }


        const processusPasser = await prisma.processusPasser.create({
            data: {
                processus_id : processus.id,
                postulation_id : postulation.id,
                statut: StatutProcessusPasser.TERMINER,
                score:0,
                lien_web,
                lien_fichier, 
                lien_vision: null                
            }    
        })

        return res.status(200).json({message: "Votre tâche est bien reçu ! "})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.startVision = async (req, res)=>{
    try {
        const processus = await prisma.processus.findUnique({
            where: {
                id: parseInt(req.params.id),
            }
        })
        
        if(!processus){
            return res.status(404).json({ error: "Processus non trouver." });
        }
        
        if(processus.type != TypeProcessus.VISIO_CONFERENCE){
            return res.status(400).json({ error: "Le processus doit être type vision conference." });
        }
        
        if(processus.statut != StatutProcessus.EN_COURS){
            return res.status(400).json({ error: "Le processus n'est pas en cours." });
        }

        const { candidats, start_time, start_date } = req.body;

        const duration = processus.duree

        if (!Array.isArray(users) || !Array.isArray(candidats) || !start_time || !start_date ) {
            return res.status(400).json({ error: "Tous les champs sont requis : users, candidats, start_time, start_date, duration" });
        }
        if (!/^\d{2}:\d{2}$/.test(start_time)) {
            return res.status(400).json({ error: "start_time doit être au format HH:mm" });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
            return res.status(400).json({ error: "start_date doit être au format YYYY-MM-DD" });
        }

        const userList = await prisma.user.findMany({
            where: { id: { in: users } },
            select: { id: true, email: true, name: true }
        });

        const candidatList = await prisma.candidat.findMany({
            where: { id: { in: candidats } },
            select: { id: true, email: true, nom: true }
        });

        if (userList.length !== users.length || candidatList.length !== candidats.length) {
            return res.status(400).json({ error: "Certains utilisateurs ou candidats n'existent pas" });
        }
        const [hours, minutes] = start_time.split(':');
        const startDateTime = new Date(`${start_date}T${hours}:${minutes}:00Z`);
        if (isNaN(startDateTime.getTime())) {
            return res.status(400).json({ error: "Date ou heure invalide" });
        }

        const summary = `Réunion planifiée par ${req.user.name}`;
        const description = `Réunion avec ${users.length} utilisateurs et ${candidats.length} candidats`;
        const meetLink = await createGoogleMeet(startDateTime.toISOString(), duration, summary, description);

        if (!meetLink) {
            return res.status(500).json({ error: "Échec de la création du Google Meet" });
        }
        const dateStr = startDateTime.toLocaleDateString('fr-CA', { timeZone: 'UTC' });
        const timeStr = startDateTime.toLocaleTimeString('fr-CA', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

        const envoiNotifications = async (recipients, type) => {
            for (const recipient of recipients) {
                await sendEmail({
                    to: recipient.email,
                    subject: `Invitation à une réunion - ${dateStr} à ${timeStr}`,
                    type: existingType.meeting,
                    data: {
                        candidatName: type === 'candidat' ? recipient.nom : recipient.name,
                        offreTitre: "N/A",
                        date: dateStr,
                        heure: timeStr,
                        meetLink: meetLink
                    },
                    saveToNotifications: true
                });
            }
        };

        await envoiNotifications(userList, 'user');
        await envoiNotifications(candidatList, 'candidat');

        console.log("Emails envoyés à tous les participants");

        return res.status(200).json({
            success: true,
            message: "Réunion planifiée et invitations envoyées avec succès",
            meetLink
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.giveNotePostulation = async (req, res)=>{
    try {
        const { processus_id, postulation_id } = req.params; 
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(processus_id) }
        });

        const postulation = await prisma.postulation.findUnique({
            where: { id: parseInt(postulation_id) }, include: { candidat: true, offre: true}
        });

        if (!postulation || !processus) {
            return res.status(404).json({ message: "Processus ou Postulation cible introuvables" });
        }
        
        if(processus.statut !== StatutProcessus.EN_COURS && processus.statut != StatutProcessus.TERMINER){
            return res.status(400).json({ message: "Processus cible n'a pas encore commencer." });
        }
        
        const { note } = req.body 
        if (!note || isNaN(note)) {
            return res.status(400).json({ message: "Note requise et doit être un nombre valide" });
        }

        const processusPasser = await prisma.processusPasser.findUnique({
            where: {
                processus_id: processus.id,
                postulation_id: postulation.id                
            }
        })
        
        if(!processusPasser){
            return res.status(404).json({ message: "Le candidat n'a pas encore passer le processus." });
        }

        await prisma.processusPasser.update({
            where: {
                id: processus.id,
            },
            data: {
                score: processusPasser.score + parseInt(note)
            }
        })


        if(processusPasser.statut !== StatutProcessusPasser.TERMINER){
            await prisma.processusPasser.update({
                where:{
                    id: processusPasser.id,
                },
                data: {
                    statut: StatutProcessusPasser.TERMINER
                }
            })            
        }

        return res.status(200).json({message: "Postulation Candidat noté avec succèss"})        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.terminateProcessus = async (req, res )=>{
    try {
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(req.params.id) }, include: { processus_passer: true}
        });

        if (!processus ) {
            return res.status(404).json({ message: "Processus cible introuvable" });
        }
        
        if(processus.statut != StatutProcessus.EN_COURS){
            return res.status(400).json({ message: "Processus n'a pas encore commencer" });
        }
        
        if(processus.processus_passer.length == 0){
            return res.status(400).json({ message: "Aucun candidat n'a encore passer ce processus" });
        }
        
        const lengthScoreZero = await prisma.processusPasser.count({
            where: {
                score: 0
            }
        })
        
        if(lengthScoreZero == processus.processus_passer.length){
            return res.status(400).json({ message: "Aucun candidat n'a encore de note à cette processus" });
        }
        
        await prisma.processus.update({
            where: {
                id: processus.id
            },
            data: {
                statut: StatutProcessus.TERMINER
            }
        })

        return res.status(200).json({message: "Processus marquer comme terminer."})        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.cancelProcessus = async (req, res)=>{
    try {
        const processus = await prisma.processus.findUnique({
            where: { id: parseInt(req.params.id) }, include: { processus_passer: true}
        });

        if (!processus ) {
            return res.status(404).json({ message: "Processus cible introuvable" });
        }
        
        if(processus.statut != StatutProcessus.A_VENIR){
            return res.status(400).json({ message: "Processus a déjà commencer" });
        }

        await prisma.processus.update({
            where: {
                id: processus.id,
            },
            data: {
                statut: StatutProcessus.ANNULER
            }
        })
        
        return res.status(200).json({message: "Processus annulé. Ce processus de recrutement ne sera plus prise en compte."})        

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

