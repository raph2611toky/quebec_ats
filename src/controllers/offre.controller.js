const Offre = require("../models/offre.model.js");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { Status, TypeProcessus } = require("@prisma/client");
const Candidat = require("../models/candidat.model");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const shareJobOnLinkedIn = require("../services/linkedin/linkedin.services.js");
const AdminAudit = require("../models/adminaudit.model.js");
const User = require("../models/user.model.js");

exports.createOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const organisationId = parseInt(req.body.organisation_id);
        const user = await User.getById(userId);
        const organisation = await prisma.organisation.findFirst({
            where: {
                id: organisationId,
                users: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!organisation) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à créer une offre pour cette organisation." });
        }

        const offreData = {
            ...req.body,
            user_id: userId,
            organisation_id: organisationId,
            image_url: req.body.image_url,
            salaire: parseFloat(req.body.salaire),
            status: Status.CREE,
            nombre_requis: parseInt(req.body.nombre_requis || 1),
            date_limite: new Date(req.body.date_limite),
        };

        const newOffre = await Offre.create(offreData);
        await AdminAudit.create(userId, "creation_offre", `${user.name} a créé une offre intitulée "${newOffre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(201).json(newOffre);
    } catch (error) {
        console.error("Erreur lors de la création de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.updateOffre = async (req, res) => {
    const allowedFields = [
        "titre",
        "user_id",
        "organisation_id",
        "image_url",
        "description",
        "date_limite",
        "status",
        "nombre_requis",
        "lieu",
        "pays",
        "type_emploi",
        "type_temps",
        "salaire",
        "devise",
    ];
    
    function filterAllowedFields(data) {
        return Object.keys(data)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});
    }
    
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);
        const user = await User.getById(userId);
        const existingOffre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: { organisation: true }
        });

        if (!existingOffre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        const organisation = await prisma.organisation.findFirst({
            where: {
                id: existingOffre.organisation_id,
                users: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!organisation) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette offre." });
        }

        if (existingOffre.status !== Status.CREE) {
            return res.status(401).json({ error: "Offre ne peut plus être modifiée." });
        }

        let { id, ...updateData } = req.body;
        updateData = filterAllowedFields(updateData);

        if (req.file) {
            const subDir = "offres";
            const uploadDir = path.join(__dirname, "../uploads", subDir);
            const originalName = req.file.originalname;
            const ext = path.extname(originalName);
            const baseName = path.basename(originalName, ext);
            const tempPath = path.join(uploadDir, req.file.filename);
            const finalPath = path.join(uploadDir, originalName);

            if (existingOffre.image_url && !existingOffre.image_url.includes("default-offre.png")) {
                const oldImagePath = path.join(__dirname, "../", existingOffre.image_url.replace(req.base_url, ""));
                await fs.unlink(oldImagePath).catch(() => {});
            }

            if (await fs.stat(finalPath).catch(() => false)) {
                const tempBuffer = await fs.readFile(tempPath);
                const tempHash = crypto.createHash("md5").update(tempBuffer).digest("hex");
                const existingBuffer = await fs.readFile(finalPath);
                const existingHash = crypto.createHash("md5").update(existingBuffer).digest("hex");

                if (tempHash === existingHash) {
                    await fs.unlink(tempPath);
                    updateData.image_url = `/uploads/offres/${originalName}`;
                } else {
                    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
                    const randomSuffix = Math.round(Math.random() * 1e9);
                    const newName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
                    const newPath = path.join(uploadDir, newName);
                    await fs.rename(tempPath, newPath);
                    updateData.image_url = `/uploads/offres/${newName}`;
                }
            } else {
                await fs.rename(tempPath, finalPath);
                updateData.image_url = `/uploads/offres/${originalName}`;
            }
        }

        if (updateData.salaire) updateData.salaire = parseFloat(updateData.salaire);
        if (updateData.nombre_requis) updateData.nombre_requis = parseInt(updateData.nombre_requis);
        if (updateData.date_limite) updateData.date_limite = new Date(updateData.date_limite);
        if (updateData.organisation_id) updateData.organisation_id = parseInt(updateData.organisation_id);

        const updatedOffre = await Offre.update(offreId, updateData);
        await AdminAudit.create(userId, "modification_offre", `${user.name} a modifié l'offre intitulée "${updatedOffre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(200).json(Offre.fromPrisma(updatedOffre, req.base_url));
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);
        const user = await User.getById(userId);
        const offre = await Offre.getById(offreId, req.base_url);

        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        const organisation = await prisma.organisation.findUnique({ where: { id: offre.organisation_id } });

        if (offre.image_url && !offre.image_url.includes("default-offre.png")) {
            const imagePath = path.join(__dirname, "../", offre.image_url.replace(req.base_url, ""));
            await fs.unlink(imagePath).catch(() => {});
        }

        if (offre.status !== Status.CREE) {
            return res.status(401).json({ error: "Offre ne peut pas être supprimée, déjà publiée." });
        }

        await Offre.delete(offreId);
        await AdminAudit.create(userId, "suppression_offre", `${user.name} a supprimé l'offre intitulée "${offre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.deleteOffreForce = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);
        const user = await User.getById(userId);
        const offre = await Offre.getById(offreId, req.base_url);

        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        const organisation = await prisma.organisation.findUnique({ where: { id: offre.organisation_id } });

        if (offre.image_url && !offre.image_url.includes("default-offre.png")) {
            const imagePath = path.join(__dirname, "../", offre.image_url.replace(req.base_url, ""));
            await fs.unlink(imagePath).catch(() => {});
        }

        await Offre.delete(offreId);
        await AdminAudit.create(userId, "suppression_force_offre", `${user.name} a forcé la suppression de l'offre intitulée "${offre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOffre = async (req, res) => {
    try {
        const offre = await Offre.getById(parseInt(req.params.id), req.base_url);
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        return res.status(200).json(offre);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAllOffres = async (req, res) => {
    try {
        const offres = await Offre.getAll(req.base_url);
        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getAvalaibleOffres = async (req, res) => {
    try {
        const offres = await Offre.getAllAvailable(req.base_url);
        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur get offre disponible:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.filterOffres = async (req, res) => {
    try {
        const {
            status,
            minNombreRequis,
            lieu,
            pays,
            type_emploi,
            salaire,
            devise,
            date_publication,
            text,
            organisation_id
        } = req.query;

        const filterConditions = {
                status: "OUVERT"
        };
        if (status) filterConditions.status = status;
        if (minNombreRequis) filterConditions.nombre_requis = { gte: parseInt(minNombreRequis) };
        if (lieu) filterConditions.lieu = { contains: lieu, mode: "insensitive" };
        if (pays) filterConditions.pays = { contains: pays, mode: "insensitive" };
        if (type_emploi) filterConditions.type_emploi = { contains: type_emploi, mode: "insensitive" };
        if (salaire) filterConditions.salaire = { gte: parseFloat(salaire) };
        if (devise) filterConditions.devise = { contains: devise, mode: "insensitive" };
        if (date_publication) filterConditions.created_at = { gte: new Date(date_publication) };
        if (organisation_id) filterConditions.organisation_id = parseInt(organisation_id);
        if (text) {
            filterConditions.OR = [
                { titre: { contains: text, mode: "insensitive" } },
                { description: { contains: text, mode: "insensitive" } },
                { organisation: { nom: { contains: text, mode: "insensitive" } } } 
            ];
        }

        const offres = await prisma.offre.findMany({
            where: filterConditions,
            include: {
                organisation: true
            }
        });

        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors du filtrage des offres:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.searchOffres = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ error: "Le paramètre 'keyword' est requis pour la recherche" });
        }

        const offres = await Offre.search(keyword, req.base_url);
        return res.status(200).json(offres);
    } catch (error) {
        console.error("Erreur lors de la recherche des offres:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getProcessusByOffre = async (req, res) => {
    try {
        const offreId = parseInt(req.params.offreId);
        const processus = await Offre.getAllProcess(offreId);
        return res.status(200).json(processus);
    } catch (error) {
        console.error("Erreur lors de la récupération des processus:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.publishOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);
        const user = await User.getById(userId);
        const offre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: {
                processus: {
                    include: {
                        questions: {
                            include: {
                                reponses: true
                            }
                        }
                    }
                }
            }
        });

        if (!offre) {
            return res.status(404).json({ error: "Offre introuvable." });
        }

        const organisation = await prisma.organisation.findUnique({ where: { id: offre.organisation_id } });

        if (offre.status === Status.FERME) {
            return res.status(400).json({ error: "Interdit. Offre déjà fermée." });
        }

        for (const processus of offre.processus) {
            if (processus.type === "QUESTIONNAIRE") {
                if (processus.questions.length === 0) {
                    return res.status(400).json({ error: "Il faut au moins ajouter une question avant de publier une offre avec un processus de questionnaire." });
                }

                for (const question of processus.questions) {
                    const hasCorrectAnswer = question.reponses.some(reponse => reponse.is_true === true);
                    if (!hasCorrectAnswer) {
                        return res.status(400).json({ error: `La question ID ${question.id} doit avoir au moins une réponse correcte.` });
                    }
                }
            }
        }

        await prisma.offre.update({
            where: { id: offreId },
            data: { status: Status.OUVERT }
        });

        await shareJobOnLinkedIn(offre.titre, offre.description, "epsnvBD8Ud", `${process.env.FRONTEND_URL}/offres-lists/${offre.id}/postuler?src=linkedin`, offre.id);
        await AdminAudit.create(userId, "publication_offre", `${user.name} a publié l'offre intitulée "${offre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(200).json({ message: "Offre publiée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la publication de l'offre:", error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.postulerOffre = async (req, res) => {
    try {
        const offre = await prisma.offre.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                organisation: true
            }
        })
            
        let data = { ...req.body };

        if (!offre) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        if (offre.status !== Status.OUVERT) {
            return res.status(400).json({ message: "Postulation à cette offre n'est plus ouverte" });
        }

        let candidat = await Candidat.findByEmail(data.email);

        if (!candidat) {
            const dataCandidat = {
                nom: data.nom,
                email: data.email,
                telephone: data.telephone
            };
            candidat = await Candidat.create(dataCandidat);
        }

        const existingPostulation = await prisma.postulation.findFirst({
            where: {
                candidat_id: candidat.id,
                offre_id: offre.id
            }
        });

        if (existingPostulation) {
            return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
        }

        const postulation = await prisma.postulation.create({
            data: {
                candidat: { connect: { id: candidat.id } },
                offre: { connect: { id: offre.id } },
                cv: data.cv,
                lettre_motivation: data.lettre_motivation,
                source_site: data.source_site
            }
        });

        await AdminAudit.create(1, "postulation_offre", `${candidat.name} a postulé à l'offre intitulée "${offre.titre}" dans l'organisation "${organisation.nom}""`);
        return res.status(200).json({ message: "Postulation effectuée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getDetailsOffres = async (req, res) => {
    try {
        const offre = await prisma.offre.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                processus: {
                    include: {
                        questions: {
                            include: {
                                reponses: true
                            }
                        }
                    }
                }, 
                postulations: {
                    include: {
                        candidat: true,
                        remarques: {
                            include: {
                                admin: true
                            }
                        } 
                    }
                }
            }
        });

        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        
        return res.status(200).json(offre);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.fermerOffre = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const offreId = parseInt(req.params.id);
        const user = await User.getById(userId);
        const offre = await prisma.offre.findUnique({
            where: {
                id: offreId
            },
            include: {
                postulations: true
            }
        });
        
        if (!offre) {
            return res.status(404).json({ message: "Offre introuvable" });
        }

        const organisation = await prisma.organisation.findUnique({ where: { id: offre.organisation_id } });
        
        if (offre.status != Status.OUVERT) {
            return res.status(404).json({ message: "Seule une offre ouverte peut être fermée" });
        }
        
        if (offre.postulations.length === 0) {
            return res.status(400).json({ message: "Aucune postulation n'a été encore reçue sur cette offre." });
        }

        await prisma.offre.update({
            where: {
                id: offreId
            },
            data: {
                status: Status.FERME
            }
        });
        
        await AdminAudit.create(userId, "fermeture_offre", `${user.name} a fermé l'offre intitulée "${offre.titre}" dans l'organisation "${organisation.nom}"`);
        return res.status(200).json({ message: "Offre fermée. Aucun candidature ne peut plus être reçu !" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOfferDetails = async (req, res) => {
    try {
        const offreId = parseInt(req.params.id);
    
        const offre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                organisation: {
                    select: { id: true, nom: true, adresse: true, ville: true },
                },
                processus: {
                    include: {
                        questions: {
                            include: {
                                reponses: true,
                            },
                        },
                    },
                },
                postulations: {
                    include: {
                        candidat: {
                            select: { id: true, nom: true, email: true, telephone: true, image: true },
                        },
                        remarques: {
                            include: {
                                admin: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                        reponse_preselection: {
                            include: {
                                question: true,
                                reponse: true,
                                processus: true,
                            }
                        }
                    },
                },
            },
        });
    
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        
        return res.status(200).json(offre);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'offre:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.getOfferDetailsGuest = async (req, res) => {
    try {
        const offreId = parseInt(req.params.id);
    
        const offre = await prisma.offre.findUnique({
            where: { id: offreId },
            include: {
                organisation: {
                    select: {
                        id: true,
                        nom: true,
                        adresse: true,
                        ville: true,
                        postcarieres: true, 
                    }
                },
                processus: {
                    include: {
                        questions: {
                            include: {
                                reponses: true,
                            },
                        },
                    },
                },
            },
        });
    
        if (!offre) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        
        return res.status(200).json(offre);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'offre:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

exports.bestMatchs = async (req, res) => {
    try {
        const offreId = parseInt(req.params.id);

        const offre = await prisma.offre.findUnique({
            where: { id: offreId },
            select: { nombre_requis: true },
        });

        if (!offre) {
            return res.status(404).json({message: "Offre non trouver"});
        }

        const nombreRequis = offre.nombre_requis;

        const topPostulations = await prisma.postulation.findMany({
            where: {
                offre_id: offreId, 
            },
            orderBy: {
                note: 'desc',  
            },
            include: {
                candidat: true,
                remarques: true,
                reponse_preselection: true  
            },
        });

        return res.status(200).json(topPostulations);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


exports.getStatsOffres = async (req, res) => {
  try {
    const totalOffres = await prisma.offre.count();

    const statusStats = await prisma.offre.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const totalPostulations = await prisma.postulation.count();
    const moyennePostulations = totalOffres ? (totalPostulations / totalOffres) : 0;

    const offresOuvertes = statusStats.find(s => s.status === 'OUVERT')?._count.status || 0;
    const pourcentageOuvertes = totalOffres ? ((offresOuvertes / totalOffres) * 100).toFixed(2) : 0;

    const topOffres = await prisma.offre.findMany({
      orderBy: {
        postulations: {
          _count: 'desc'
        }
      },
      take: 5,
      select: {
        id: true,
        titre: true,
        status: true,
        postulations: {
          select: { id: true }
        },
        organisation: {
          select: { nom: true }
        }
      }
    });

    const offresDetaillees = await prisma.offre.findMany({
      select: {
        id: true,
        titre: true,
        status: true,
        created_at: true,
        organisation: {
          select: { nom: true }
        },
        user: {
          select: { name: true, email: true }
        },
        postulations: {
          select: { id: true }
        },
        processus: {
          select: { id: true }
        }
      }
    });

    const offresMap = offresDetaillees.map(offre => ({
      id: offre.id,
      titre: offre.titre,
      status: offre.status,
      organisation: offre.organisation.nom,
      user: offre.user,
      nombre_postulations: offre.postulations.length,
      nombre_processus: offre.processus.length
    }));

    return res.json({
      total_offres: totalOffres,
      status_stats: statusStats,
      moyenne_postulations_par_offre: Number(moyennePostulations.toFixed(2)),
      pourcentage_ouvertes: `${pourcentageOuvertes}%`,
      top_5_offres: topOffres.map(o => ({
        id: o.id,
        titre: o.titre,
        status: o.status,
        organisation: o.organisation.nom,
        nombre_postulations: o.postulations.length
      })),
      offres_détaillées: offresMap
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
  }
};

