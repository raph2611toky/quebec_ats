require("dotenv").config()
const Postulation = require("../models/postulation.model");
const Candidat = require("../models/candidat.model");
const Referent = require("../models/referent.model");
const Offre = require("../models/offre.model");
const fs = require("fs").promises;
const path = require("path");
const { generateToken, verifyToken } = require("../utils/securite/jwt")
const { encryptAES, decryptAES } = require("../utils/securite/cryptographie")
const { sendEmail } = require("../services/notifications/email");
const prisma = require("../config/prisma.config");
const { EtapeActuelle, Status } = require("@prisma/client");
const { count } = require("console");
const Remarque = require("../models/remarque.model");

exports.createPostulation = async (req, res) => {
    try {
        base_url = req.base_url
        
        // console.log(req.body);
        const offreId = parseInt(req.body.offre_id)
        // console.log(offreId);
        if(isNaN(offreId)){
            return res.status(400).json({ error: "Offre Id non valide" });
        }
        const offre = await Offre.getById(offreId, base_url);
        if (!offre) {
            return res.status(400).json({ error: "Offre non trouvée" });
        }
        let candidat = await Candidat.findByEmail(req.body.email, base_url);
        if (!candidat) {
            candidat = await Candidat.create(
                {
                    email: req.body.email,
                    nom: req.body.nom,
                    telephone: req.body.telephone || null,
                    image: `/uploads/candidats/default.png`
                },
                base_url
            );
        }

        if (req.body.hasReferent === "true" && req.body.referents) {
            const referentsData = JSON.parse(req.body.referents);
            for (const refData of referentsData) {
                let referent = await Referent.findByEmail(refData.email);
                if (!referent) {
                    referent = await Referent.create({
                        email: refData.email,
                        nom: refData.nom,
                        telephone: refData.telephone,
                        recommendation: null,
                        statut: "NON_APPROUVE"
                    });
                }
                await Candidat.addReferent(candidat.id, referent.id);

                const token = generateToken({
                    referent_id: referent.id,
                    candidat_id: candidat.id
                });

                const encryptedToken = encryptAES(token);

                const confirmationLink = `${process.env.FRONTEND_URL}/referents/confirm/${encodeURIComponent(encryptedToken)}`;

                await sendEmail({
                    to: referent.email,
                    subject: "Confirmation de référence",
                    type: "referentConfirmation",
                    data: { candidatName: candidat.nom, offreTitre: offre.titre, confirmationLink },
                    saveToNotifications: true
                });
            }
        }
        const postulationData = {
            candidat_id: candidat.id,
            offre_id: parseInt(req.body.offre_id),
            cv: req.body.cv,
            lettre_motivation: req.body.lettre_motivation,
            telephone: req.body.telephone || null,
            source_site: req.body.source_site
        };

        const newPostulation = await Postulation.create(postulationData, req.base_url);
        await sendEmail({
            to: candidat.email,
            subject: "Accusé de réception de votre postulation",
            type: "postulationAcknowledgment",
            data: { candidatName: candidat.nom, offreTitre: offre.titre },
            saveToNotifications: true
        });

        return res.status(201).json(Postulation.fromPrisma(newPostulation, base_url));
    } catch (error) {
        console.error("Erreur lors de la création de la postulation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getPostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id), req.base_url);
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }
        return res.status(200).json(postulation); 
    } catch (error) {
        console.error("Erreur lors de la récupération de la postulation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllPostulations = async (req, res) => {
    try {
        const postulations = await Postulation.getAll(req.base_url);
        return res.status(200).json(postulations);
    } catch (error) {
        console.error("Erreur lors de la récupération des postulations:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.updatePostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id), req.base_url);
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }

        const subDir = "candidats";
        const uploadDir = path.join(__dirname, "../uploads", subDir);
        let updateData = { ...req.body };

        if (req.files && req.files.cv) {
            const cvFile = req.files.cv[0];
            const cvOriginalName = cvFile.originalname;
            const cvTempPath = path.join(uploadDir, cvFile.filename);
            const cvFinalPath = path.join(uploadDir, cvOriginalName);
            if (await fs.stat(cvFinalPath).catch(() => false)) {
                console.log("file exist");
                
            } else {
                await fs.rename(cvTempPath, cvFinalPath);
            }
            updateData.cv = `/uploads/candidats/${cvOriginalName}`;
        }

        if (req.files && req.files.lettre_motivation) {
            const lettreFile = req.files.lettre_motivation[0];
            const lettreOriginalName = lettreFile.originalname;
            const lettreTempPath = path.join(uploadDir, lettreFile.filename);
            const lettreFinalPath = path.join(uploadDir, lettreOriginalName);
            if (await fs.stat(lettreFinalPath).catch(() => false)) {
                // await fs.unlink(lettreTempPath);
            } else {
                await fs.rename(lettreTempPath, lettreFinalPath);
            }
            updateData.lettre_motivation = `/uploads/candidats/${lettreOriginalName}`;
        }

        const updatedPostulation = await Postulation.update(postulation.id, updateData);
        return res.status(200).json(Postulation.fromPrisma(updatedPostulation, req.base_url));
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la postulation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.deletePostulation = async (req, res) => {
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id), req.base_url);
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée" });
        }

        // if (postulation.cv) {
        //     const cvPath = path.join(__dirname, "../", postulation.cv.replace(req.base_url, ""));
        //     // await fs.unlink(cvPath).catch(() => {});
        // }
        // if (postulation.lettre_motivation) {
        //     const lettrePath = path.join(__dirname, "../", postulation.lettre_motivation.replace(req.base_url, ""));
        //     await fs.unlink(lettrePath).catch(() => {});
        // }

        await Postulation.delete(postulation.id);
        return res.status(200).json({ message: "Postulation supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la postulation:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.confirmReferenceWithRecommendation = async (req, res) => {
    try {
        const { recommendation, encryptedToken } = req.body;
        
        if (!recommendation || !encryptedToken) {
            return res.status(400).json({ error: "Recommandation et encryptedToken sont requis" });
        }
        
        let token;
        try {
            token = decryptAES(encryptedToken);
        } catch (error) {
            return res.status(400).json({ error: "Lien de confirmation invalide" });
        }
        
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(400).json({ error: "Lien de confirmation expiré ou invalide" });
        }
        
        const { referent_id, candidat_id } = decoded;
        
        const postulation = await Postulation.findByCandidatId(candidat_id, process.env.FRONTEND_URL);
        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée pour ce candidat" });
        }
        
        const referent = await Referent.getById(parseInt(referent_id), process.env.FRONTEND_URL);
        if (!referent) {
            return res.status(404).json({ error: "Référent non trouvé" });
        }
        
        const candidatReferent = await Candidat.getReferent(candidat_id, referent_id);
        if (!candidatReferent) {
            return res.status(403).json({ error: "Ce référent n'est pas associé à ce candidat" });
        }

        await Referent.update(referent_id, {
            recommendation,
            statut: "APPROUVE"
        });
        
        return res.status(200).json({
            message: "Référence confirmée avec succès",
            referent: await Referent.getById(referent_id, process.env.FRONTEND_URL)
        });
    } catch (error) {
        console.error("Erreur lors de la confirmation de la référence:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.acceptPostulation = async (req, res) => {
    try {
        const postulation = await prisma.postulation.findUnique({
            where: {
                id: parseInt(req.params.id),    
            },
            include: {
                offre: true, 
            },            
        });

        if (!postulation) {
            return res.status(400).json({ error: "Aucune postulation trouvée." });
        }

        if (postulation.offre.status === Status.FERME) { // Vérifie si l'offre est fermée
            return res.status(400).json({ error: "Peut pas engager. Offre déjà fermée." });
        }
        
        const nombrePostulationAccepterOffre = await prisma.postulation.count({
            where:{
                offre_id: postulation.offre_id,
                etape_actuelle: EtapeActuelle.ACCEPTE
            },
            
        })

        if(nombrePostulationAccepterOffre == postulation.offre.nombre_requis){
            return res.status(400).json({ error: "Le nombre requis pour le post est déjà atteint." })
        }
        
        if (postulation.etape_actuelle === EtapeActuelle.ACCEPTE) { // Vérifie si déjà accepté
            return res.status(400).json({ error: "Postulation déjà acceptée." });
        }
        
        // Mise à jour de la postulation
        const updatedPostulation = await prisma.postulation.update({
            where: { id: postulation.id },
            data: { etape_actuelle: EtapeActuelle.ACCEPTE },
        });

        // TODO: Envoyer un email au candidat pour lui notifier l'acceptation

        return res.status(200).json({ message: `Candidat accepté pour le post : ${postulation.offre.titre}` });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


exports.rejectPostulation = async (req, res) => {
    try {
        const postulation = await prisma.postulation.findUnique({
            where: {
                id: parseInt(req.params.id),    
            },
            include: {
                offre: true, 
            },            
        });

        if (!postulation) {
            return res.status(400).json({ error: "Aucune postulation trouvée." });
        }
        
        if (postulation.offre.status === Status.FERME) { // Vérifie si l'offre est fermée
            return res.status(400).json({ error: "Peut pas engager. Offre déjà fermée." });
        }
        
        if (postulation.etape_actuelle === EtapeActuelle.ACCEPTE) { // Vérifie si déjà accepté
            return res.status(400).json({ error: "Postulation déjà acceptée." });
        }
        
        // Mise à jour de la postulation
        const updatedPostulation = await prisma.postulation.update({
            where: { id: postulation.id },
            data: { etape_actuelle: EtapeActuelle.ACCEPTE },
        });

        // TODO: Envoyer un email au candidat pour lui notifier du rejet si la première fois

        return res.status(200).json({ message: `Candidat rejeté pour le post : ${postulation.offre.titre}` });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.addRemarquePostulation = async (req,res ) => {
    try {
        const admin_id = req.user.id;

        const postulation = await Postulation.getById(parseInt(req.params.id))
        if (!postulation) {
            return res.status(400).json({ error: "Aucune postulation trouvée." });
        }
        const offre = await Offre.getById(postulation.offre_id)
        
        const remarque = await Remarque.create({
          admin_id,
          postulation_id: postulation.id,
          text: req.body.text
        })

        return res.status(200).json({ message: `Remarque ajouté sur le postulation du candidat à l'offre : ${offre.titre}` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.getAllRemarquePostulation = async (req, res)=>{
    try {
        const postulation = await Postulation.getById(parseInt(req.params.id))
        if (!postulation){
            return res.status(400).json({ error: "Aucune postulation trouvée." });
        }

        const remarques = await prisma.remarque.findMany({
            where: {
                postulation_id : postulation.id
            }
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

exports.removeRemarquePostulation = async (req, res)=> {
    try {
        const admin_id = parseInt(req.user.id);
        const remarque_id = parseInt(req.params.id)

        const remarque = await Remarque.getById(remarque_id)

        if(admin_id != remarque.admin_id){
            return res.status(400).json({message : "cett Remarque n'est pas la vôtre !"})
        }

        await prisma.remarque.delete({
            where: {
                id: remarque_id
            }
        })

        return res.status(200).json({ message: `Remarque enlevé sur le postulation du candidat ` });
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }


}

exports.updateRemarquePostulation = async (req, res)=> {
    try {
        const admin_id = parseInt(req.user.id);
        const remarque_id = parseInt(req.params.id)

        const remarque = await Remarque.getById(remarque_id)

        if(admin_id != remarque.admin_id){
            return res.status(400).json({message : "cett Remarque n'est pas la vôtre !"})
        }

        await prisma.remarque.update({
            where: {
                id: remarque_id
            },
            data: {
                text: req.body.text
            }
        })

        return res.status(200).json({ message: `Remarque mis à jour.` });       

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
    
    
}

exports.getDetailsPostulation = async (req, res)=>{
    try {
        const postulation = await prisma.postulation.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                processus_passer: true,
                remarques: {
                    include: {
                        admin: true
                    }
                }
            }
        })

        if(!postulation){
            return res.status(400).json({ error: "Aucune postulation trouvée." });
        }

        return res.status(200).json(postulation)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}


exports.getDetailsPostulationCandidat = async (req, res) => {
    try {
        // Récupération de la postulation par ID
        const postulation = await prisma.postulation.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                processus_passer: {
                    include: {
                        processus: true
                    }
                },
            }
        });

        if (!postulation) {
            return res.status(404).json({ error: "Postulation non trouvée." });
        }

        // Vérifier si le candidat a postulé à cette offre
        const havePostuled = await prisma.postulation.findUnique({
            where: {
                candidat_id_offre_id: {
                    candidat_id: parseInt(req.candidat.id),
                    offre_id: postulation.offre_id
                }
            }
        });

        if (!havePostuled) {
            return res.status(403).json({ error: "Vous n'avez pas postulé à cette offre." });
        }

        // Transformation des résultats de processus passé
        const results = postulation.processus_passer.map(passedProcess => ({
            "statut": passedProcess.statut,
            "type_processus": passedProcess.processus.type
        }));

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};



