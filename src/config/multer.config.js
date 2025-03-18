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
    const cvFiletypes = /jpeg|jpg|png|gif|webp|pdf/;
    const cvMimetypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf"
    ];

    const lettreFiletypes = /pdf|docx|txt|md/;
    const lettreMimetypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown"
    ];

    if (file.fieldname === "cv") {
        const mimetype = cvMimetypes.includes(file.mimetype);
        const extname = cvFiletypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error("Le CV doit être une image (JPEG, JPG, PNG, GIF, WebP) ou un PDF"));
    } else if (file.fieldname === "lettre_motivation") {
        const mimetype = lettreMimetypes.includes(file.mimetype);
        const extname = lettreFiletypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error("La lettre de motivation doit être un fichier PDF, DOCX, TXT ou MD"));
    } else {
        return cb(new Error("Champ de fichier non reconnu"));
    }
};

const createUpload = (subDir) =>
    multer({
        storage: storage(subDir),
        fileFilter: fileFilter,
        limits: { fileSize: 20 * 1024 * 1024 }
    });

module.exports = createUpload;