const multer = require("multer");
const path = require("path");
const fs = require("fs");

const getUploadDir = (subDir) => {
    const uploadDir = path.join(__dirname, "../uploads", subDir || "");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

const storage = (subDir) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, getUploadDir(subDir));
        },
        filename: (req, file, cb) => {
            const originalName = file.originalname;
            const ext = path.extname(originalName);
            const baseName = path.basename(originalName, ext);
            let finalName = originalName;

            const filePath = path.join(getUploadDir(subDir), finalName);

            if (fs.existsSync(filePath)) {
                const tempName = `${baseName}-temp-${Date.now()}${ext}`;
                return cb(null, tempName);
            }

            cb(null, finalName);
        }
    });

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Seules les images au format JPEG, JPG ou PNG sont autorisées"));
};

const createUpload = (subDir) =>
    multer({
        storage: storage(subDir),
        fileFilter: fileFilter,
        limits: { fileSize: 15 * 1024 * 1024 } 
    });

module.exports = createUpload;