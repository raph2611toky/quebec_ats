const axios = require('axios');

const LINKEDIN_API_URL = process.env.LINKEDIN_API_URL;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN; 
const ORGANIZATION_URN = process.env.ORGANIZATION_URN;

const postJobToLinkedIn = async (job) => {
  try {
    const payload = {
      integrationContext: ORGANIZATION_URN, 
      title: job.titre, 
      description: job.description, 
      location: job.lieu, 
      applyUrl: `https://votre-ats.com/apply/${job.id}`, 
      employmentType: job.type_emploi, 
      externalJobPostingId: job.id.toString(),
    };

    const response = await axios.post(LINKEDIN_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202306', 
      },
    });

    return {
      success: true,
      linkedinJobUrn: response.headers['x-linkedin-id'],
      message: 'Offre publiée avec succès sur LinkedIn',
    };
  } catch (error) {
    console.error('Erreur lors de la publication sur LinkedIn:', error.response?.data || error.message);
    throw new Error('Échec de la publication de l’offre sur LinkedIn');
  }
};

module.exports = { postJobToLinkedIn };