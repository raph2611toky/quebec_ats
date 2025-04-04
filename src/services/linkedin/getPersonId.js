const axios = require("axios");

let LINKEDIN_ACCESS_TOKEN = "  AQUpklSv5B9UyjtgrnZoKwJ_MwRa1xNL8NeeoayaRh2JsZP4pcfOm-hf0KTVjpK8V6HD420VvgXaAZGdoSr47VHHS0HmLUVim9lUFX07n8LAYyNVp8D1ihUKR3-UIMKCiV3H84gnUVFTXptSCxtJngyl4hvq29kHoT7XQSsxZAhPvZJZ6wbekWRXtnWOkkAyN8Md9sIfFaij7gEJ-j0UZs3CXab-5yh6D89jsJ0rK_Xk9bnWUBwWZyls-yoYBU6xcKswK-_ly5Dgq1sDDpZ5ySFvcFPs4HhXFEzr91uU2ruZjXY5UrKLUMe34oK2v5gSHDpydTbKVanG6lvl-s8YU11wyYpPgw"

async function getPersonId() {
    try {
        const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: {
                'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const personId = response.data.sub;
        console.log("Votre personId est :", personId); // RkQ7KkQkp9
        return personId;
    } catch (error) {
        console.log(error)
        console.error("Erreur lors de la récupération du personId :", error.response?.data || error.message);
        return null;
    }
}

getPersonId();