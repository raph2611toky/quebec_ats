const axios = require("axios");

let LINKEDIN_ACCESS_TOKEN = " AQWEbuMjicdh9Fhe7ioGVbCLto08HbHAEKGSI5Gc9VO2NHz3QL5ziGsNigjTQx1VZSpAB4VwJHlX8HHdSDeNEQwB9DD0aWtv28XBPLYJanICwi42JNzDalBg6kXzmoQPYbNQwd1EWw5nHq5NAXDnLxKM59fk3gjTpg93mi0nUCF4wFHePo55M07S6ToqC1kMUJepJi_pMxROY2mWIPCVyd-VwiuUrrjAPhYQ7Y0LkSkFDs5Jf3-JOydUfrmBmkhqUgXaYr7clTMQB2XlpMIFUZg7MvmTlxLNLW3fRU1Rg5FoooSyteB7VWsYriGFD2l43YbJVPXQr3lt8_RODD-aPv3vfkaY0Q"

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