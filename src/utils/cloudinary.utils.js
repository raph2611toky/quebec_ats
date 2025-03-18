const cloudinary = require("../config/cloudinary.config");
const path = require("path");

const uploadDefaultProfileImage = async () => {
    try {
        const defaultImagePath = path.join(__dirname, "../uploads/profile.png");

        const result = await cloudinary.uploader.upload(defaultImagePath, {
            folder: "admin_profiles",
            public_id: "default_profile",
            overwrite: false
        });

        return result.secure_url;
    } catch (error) {
        console.error("Erreur lors de l'upload de l'image par défaut:", error);
        throw error;
    }
};

const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        console.log("Suppression de l'image avec public_id:", publicId);

        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
            throw new Error("Échec de la suppression de l'image sur Cloudinary");
        }
        console.log("Image supprimée avec succès:", result);
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image sur Cloudinary:", error);
    }
};

module.exports = { uploadDefaultProfileImage, deleteImageFromCloudinary };