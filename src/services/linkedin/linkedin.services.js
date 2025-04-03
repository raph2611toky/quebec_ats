const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let LINKEDIN_ACCESS_TOKEN = "AQWEbuMjicdh9Fhe7ioGVbCLto08HbHAEKGSI5Gc9VO2NHz3QL5ziGsNigjTQx1VZSpAB4VwJHlX8HHdSDeNEQwB9DD0aWtv28XBPLYJanICwi42JNzDalBg6kXzmoQPYbNQwd1EWw5nHq5NAXDnLxKM59fk3gjTpg93mi0nUCF4wFHePo55M07S6ToqC1kMUJepJi_pMxROY2mWIPCVyd-VwiuUrrjAPhYQ7Y0LkSkFDs5Jf3-JOydUfrmBmkhqUgXaYr7clTMQB2XlpMIFUZg7MvmTlxLNLW3fRU1Rg5FoooSyteB7VWsYriGFD2l43YbJVPXQr3lt8_RODD-aPv3vfkaY0Q"  


async function getOfferImageAndUploadToLinkedIn(offerId, personId) {
    try {
        const offre = await prisma.offre.findUnique({
            where: { id: offerId },
            select: { image_url: true }
        });

        if (!offre || !offre.image_url) {
            console.warn("Aucune image trouvée pour cette offre.");
            return null;
        }

        const imageUrl = offre.image_url;
        let imageBuffer;

        if (imageUrl.startsWith("http")) {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            imageBuffer = Buffer.from(response.data);
        } else {
            const imagePath = path.join(__dirname, "../uploads/offres", imageUrl);
            if (!fs.existsSync(imagePath)) {
                console.warn("Fichier image introuvable :", imagePath);
                return null;
            }
            imageBuffer = fs.readFileSync(imagePath);
        }

        return await uploadImageToLinkedIn(imageBuffer, personId);
    } catch (error) {
        console.error("Erreur lors du téléchargement de l'image :", error.message);
        return null;
    }
}

async function uploadImageToLinkedIn(imageBuffer, personId) {
    try {
        const registerResponse = await axios.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            {
                registerUploadRequest: {
                    owner: `urn:li:person:${personId}`,
                    recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                    serviceRelationships: [
                        {
                            identifier: "urn:li:userGeneratedContent",
                            relationshipType: "OWNER",
                        },
                    ],
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
            }
        );

        const uploadUrl = registerResponse.data.value.uploadMechanism[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
        const assetId = registerResponse.data.value.asset;

        await axios.put(uploadUrl, imageBuffer, {
            headers: {
                "Content-Type": "image/*",
            },
        });

        return assetId;
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'image sur LinkedIn:", error.response?.data || error.message);
        return null;
    }
}

async function shareJobOnLinkedIn(title, description, personId, applyUrl, offerId) {
    try {
        const assetId = await getOfferImageAndUploadToLinkedIn(offerId, personId);

        const postData = {
            author: `urn:li:person:${personId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: `${title}\n\n${description}\n\nPostulez ici : ${applyUrl}`,
                    },
                    shareMediaCategory: assetId ? "IMAGE" : "NONE",
                    media: assetId
                        ? [
                              {
                                  status: "READY",
                                  description: { text: "Image associée au post" },
                                  media: assetId,
                                  title: { text: title },
                              },
                          ]
                        : [],
                },
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS",
            },
        };

        const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", postData, {
            headers: {
                Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
            },
        });

        console.log("Post partagé avec succès sur LinkedIn :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors du partage sur LinkedIn :", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

//shareJobOnLinkedIn("TESTE API Linkedin ", "TESTE API POST Linkedin", "7W9BCC_46N", "https://example.com/apply", 4);

module.exports = shareJobOnLinkedIn;
