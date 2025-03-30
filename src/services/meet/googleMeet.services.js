const { google } = require('googleapis');
require("dotenv").config();

CLIENT_ID=process.env.MEET_CLIENT_ID
CLIENT_SECRET=process.env.MEET_CLIENT_SECRET
REDIRECT_URI=process.env.MEET_REDIRECT_URI
REFRESH_TOKEN=process.env.MEET_REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

async function createGoogleMeet( startTime, duration, summary, description) {
  
  try{

  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60000); 

  const event = {
    summary: summary || "Réunion Google Meet",
    description: description || "Lien Google Meet automatique",
    start: { dateTime: startDate.toISOString(), timeZone: "UTC" },
    end: { dateTime: endDate.toISOString(), timeZone: "UTC" },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  const meetLink = response.data.hangoutLink;

  //console.log("Lien Google Meet:", meetLink);

  return meetLink;

  } catch (error) {
    console.error(error);
  }
  
}

module.exports = createGoogleMeet;