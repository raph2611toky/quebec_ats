const axios = require('axios');

const INDEED_API_URL = process.env.INDEED_API_URL;
const INDEED_ACCESS_TOKEN = process.env.INDEED_ACCESS_TOKEN;

const postJobToIndeed = async (job) => {
  try {
    const payload = {
      jobTitle: job.titre,
      description: job.description,
      location: job.lieu,
      externalJobId: job.id.toString(),
      applyUrl: `https://votre-ats.com/apply/${job.id}`, 
      sponsored: false, // true si sponsorisée
    };

    const response = await axios.post(INDEED_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${INDEED_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      indeedJobId: response.data.sourcedPostingId, // ID retourné par Indeed
      message: 'Offre publiée avec succès sur Indeed',
    };
  } catch (error) {
    console.error('Erreur lors de la publication sur Indeed:', error.response?.data || error.message);
    throw new Error('Échec de la publication de l’offre sur Indeed');
  }
};

module.exports = { postJobToIndeed };