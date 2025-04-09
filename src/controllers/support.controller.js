const { PrismaClient } = require('@prisma/client');
const { sendEmail, existingType } = require('../services/notifications/email');

const prisma = require("../config/prisma.config")

const TECH_SUPPORT_EMAIL = process.env.TECH_SUPPORT_EMAIL;

module.exports.createAdminSupportRequest = async (req, res) => {
    const { sujet, contenu, emailSource } = req.body;
    try {
      if (!sujet || !contenu || !emailSource) {
        return res.status(400).json({ error: 'Tous les champs (type, sujet, contenu, emailSource) sont requis' });
      }
  
      const supportRequest = await prisma.supportSiteRequest.create({
        data: {
          sujet,
          contenu,
          emailSource,
          statut: 'EN_ATTENTE',
        },
      });
  
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMINISTRATEUR',
        },
        select: {
          email: true,
        },
      });
  
      const adminEmails = admins.map((admin) => admin.email);
  
      if (adminEmails.length === 0) {
        console.warn('Aucun administrateur trouvé pour recevoir l’email.');
      } else {
        await sendEmail({
          to: adminEmails.join(','),
          subject: `Nouvelle demande de support : ${sujet}`,
          type: existingType.supportClientToAdmin,
          data: { sujet, contenu, emailSource },
          saveToNotifications: true,
        });
      }
  
      return res.status(201).json({ message: 'Demande de support créée avec succès', supportRequest });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur lors de la création de la demande' });
    }
};
  
  module.exports.createTechnicalSupportRequest = async (req, res) => {
    const { sujet, contenu, emailSource=req.user.email } = req.body;
  
    try {
      if (!sujet || !contenu || !emailSource) {
        return res.status(400).json({ error: 'Tous les champs (sujet, contenu, emailSource) sont requis' });
      }
  
      await sendEmail({
        to: TECH_SUPPORT_EMAIL,
        subject: `Demande de Support Technique : ${sujet}`,
        type: existingType.supportToTechnical,
        data: { sujet, contenu, emailSource },
      });
  
      res.status(200).json({ message: 'Demande envoyée au support technique avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l’envoi de la demande' });
    }
};

module.exports.updateSupportRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  try {
    const validStatuts = ['EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const supportRequest = await prisma.supportSiteRequest.update({
      where: { id: parseInt(id) },
      data: { statut },
    });

    res.status(200).json({ message: 'Statut mis à jour avec succès', supportRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

module.exports.deleteSupportRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.supportSiteRequest.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la demande' });
  }
};

module.exports.getAllSupportRequests = async (req, res) => {
  try {
    const supportRequests = await prisma.supportSiteRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(supportRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
};

module.exports.getSupportRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const supportRequest = await prisma.supportSiteRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supportRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    res.status(200).json(supportRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la demande' });
  }
};