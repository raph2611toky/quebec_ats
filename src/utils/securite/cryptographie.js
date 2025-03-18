const { createCipheriv, createDecipheriv } = require("crypto");

const FIXED_AES_KEY = Buffer.from(process.env.AES_KEY, "utf8");

const generateIV = () => Buffer.from("123456789012", "utf8");

const encryptAES = (text) => {
    const iv = generateIV();
    const cipher = createCipheriv("aes-256-gcm", FIXED_AES_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
};

const decryptAES = (encryptedData) => {
    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipheriv("aes-256-gcm", FIXED_AES_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};

module.exports = { encryptAES, decryptAES };