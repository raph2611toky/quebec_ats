const { body } = require("express-validator");

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

const createOffreValidationRules = [
    body("titre")
        .notEmpty()
        .withMessage("Le titre est requis")
        .isLength({ min: 2, max: 100 })
        .withMessage("Le titre doit être entre 2 et 100 caractères"),
    body("description")
        .notEmpty()
        .withMessage("La description est requise"),
    body("date_limite")
        .notEmpty()
        .withMessage("La date limite est requise")
        .isISO8601()
        .withMessage("La date limite doit être au format ISO8601 (ex: 2025-04-30T23:59:59Z)"),
    body("status")
        .notEmpty()
        .withMessage("Le statut est requis")
        .isIn(["OUVERT", "FERME"])
        .withMessage("Le statut doit être OUVERT ou FERME"),
    body("nombre_requis")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Le nombre requis doit être un entier positif"),
    body("lieu")
        .notEmpty()
        .withMessage("Le lieu est requis"),
    body("pays")
        .notEmpty()
        .withMessage("Le pays est requis"),
    body("type_emploi")
        .notEmpty()
        .withMessage("Le type d'emploi est requis"),
    body("salaire")
        .notEmpty()
        .withMessage("Le salaire est requis")
        .isNumeric()
        .withMessage("Le salaire doit être un nombre"),
    body("devise")
        .notEmpty()
        .withMessage("La devise est requise")
        .isIn(["EURO", "DOLLAR", "DOLLAR_CANADIAN", "LIVRE", "YEN", "ROUPIE", "ARIARY"])
        .withMessage("Devise invalide"),
    body("horaire_ouverture")
        .notEmpty()
        .withMessage("L'heure d'ouverture est requise")
        .matches(timeRegex)
        .withMessage("L'heure d'ouverture doit être au format HH:mm:ss (ex: 09:00:00)"),
    body("horaire_fermeture")
        .notEmpty()
        .withMessage("L'heure de fermeture est requise")
        .matches(timeRegex)
        .withMessage("L'heure de fermeture doit être au format HH:mm:ss (ex: 17:00:00)")
];

const updateOffreValidationRules = [
    body("titre")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Le titre doit être entre 2 et 100 caractères"),
    body("description")
        .optional(),
    body("date_limite")
        .optional()
        .isISO8601()
        .withMessage("La date limite doit être au format ISO8601 (ex: 2025-04-30T23:59:59Z)"),
    body("status")
        .optional()
        .isIn(["OUVERT", "FERME"])
        .withMessage("Le statut doit être OUVERT ou FERME"),
    body("nombre_requis")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Le nombre requis doit être un entier positif"),
    body("lieu")
        .optional(),
    body("pays")
        .optional(),
    body("type_emploi")
        .optional(),
    body("salaire")
        .optional()
        .isNumeric()
        .withMessage("Le salaire doit être un nombre"),
    body("devise")
        .optional()
        .isIn(["EURO", "DOLLAR", "DOLLAR_CANADIAN", "LIVRE", "YEN", "ROUPIE", "ARIARY"])
        .withMessage("Devise invalide"),
    body("horaire_ouverture")
        .optional()
        .matches(timeRegex)
        .withMessage("L'heure d'ouverture doit être au format HH:mm:ss (ex: 09:00:00)"),
    body("horaire_fermeture")
        .optional()
        .matches(timeRegex)
        .withMessage("L'heure de fermeture doit être au format HH:mm:ss (ex: 17:00:00)")
];

module.exports = { createOffreValidationRules, updateOffreValidationRules };