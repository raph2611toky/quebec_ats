const createGoogleMeet = require("./googleMeet.services.js");

async function generateMeetLink() {
  try {

    const meetLink = await createGoogleMeet("2025-04-02T14:00:00Z", 30);
    console.log(meetLink);
  } catch (error) {
    console.error("Erreur lors de la création du lien Meet:", error);
  }
}

generateMeetLink();