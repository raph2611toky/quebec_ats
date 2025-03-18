const { body } = require("express-validator");

const phoneRegex = /^(?:\+?\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/;

const createUserValidationRules = [
    body("name")
        .notEmpty()
        .withMessage("Le nom est requis")
        .isLength({ min: 2, max: 100 })
        .withMessage("Nom trop court ou trop long (min 2, max 100)"),
    body("email")
        .notEmpty()
        .withMessage("L'email est requis")
        .isEmail()
        .withMessage("L'email n'est pas valide"),
    body("password")
        .notEmpty()
        .withMessage("Le mot de passe est requis")
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("phone")
        .notEmpty()
        .withMessage("Le téléphone est requis")
        .matches(phoneRegex)
        .withMessage("Le numéro de téléphone n'est pas valide"),
    body("role")
        .optional()
        .isIn(["MODERATEUR", "ADMINISTRATEUR"])
        .withMessage("Le rôle doit être MODERATEUR ou ADMINISTRATEUR")
];

const updateUserValidationRules = [
    body("name")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Nom trop court ou trop long (min 2, max 100)"),
    body("email")
        .optional()
        .isEmail()
        .withMessage("L'email n'est pas valide"),
    body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("phone")
        .optional()
        .matches(phoneRegex)
        .withMessage("Le numéro de téléphone n'est pas valide"),
    body("role")
        .optional()
        .isIn(["MODERATEUR", "ADMINISTRATEUR"])
        .withMessage("Le rôle doit être MODERATEUR ou ADMINISTRATEUR")
];

module.exports = { createUserValidationRules, updateUserValidationRules };