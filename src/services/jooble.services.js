const axios = require('axios');

const JOOBLE_API_URL = process.env.JOOBLE_API_URL;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY; 

const postJobToJooble = async (job) => {
  try {

    const payload = {
      title: job.titre,
      description: job.description, 
      location: job.lieu,
      externalId: job.id.toString(),
      applyUrl: `https://votre-ats.com/apply/${job.id}`, 
      employmentType: job.type_emploi,
      premium: false, // true si vous voulez une offre Premium (payante)
    };

    const response = await axios.post(JOOBLE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JOOBLE_API_KEY}`,
      },
    });

    return {
      success: true,
      joobleJobId: response.data.jobId || response.data.id, 
      message: 'Offre publiée avec succès sur Jooble',
    };
  } catch (error) {
    console.error('Erreur lors de la publication sur Jooble:', error.response?.data || error.message);
    throw new Error('Échec de la publication de l’offre sur Jooble');
  }
};

module.exports = { postJobToJooble };