const { body } = require("express-validator");
const { TypeProcessus, StatutProcessus } = require("@prisma/client");

const createProcessusValidator = [
    body("offre_id")
    .isInt()
    .withMessage("L'ID de l'offre doit être un entier"),


    body("titre")
        .trim()
        .notEmpty()
        .withMessage("Le titre est requis")
        .isString()
        .withMessage("Le titre doit être une chaîne de caractères")
        .isLength({ min: 3, max: 200 })
        .withMessage("Le titre doit contenir entre 3 et 100 caractères"),
    
    body("description")
        .trim()
        .notEmpty()
        .withMessage("La description est requise")
        .isString()
        .withMessage("La description doit être une chaîne de caractères")
        .isLength({ min: 10, max: 255 })
        .withMessage("La description doit contenir entre 10 et 500 caractères"),
    
    body("type")
        .optional()
        .isIn([TypeProcessus.QUESTIONNAIRE,TypeProcessus.TACHE,TypeProcessus.VISIO_CONFERENCE])
        .withMessage("Le type doit être VISIO_CONFERENCE, PRESENTIEL ou HYBRIDE"),
    
    body("statut")
        .optional()
        .isIn([StatutProcessus.A_VENIR, StatutProcessus.EN_COURS, StatutProcessus.TERMINER, StatutProcessus.ANNULER])
        .withMessage("Le statut doit être A_VENIR, EN_COURS, TERMINE ou ANNULE"),
    
    body("duree")
        .notEmpty()
        .withMessage("La durée est requise")
        .isInt({ min: 1 })
        .withMessage("La durée doit être un nombre entier positif en minutes"),
    
];

const updateProcessusValidator = [
    body("offre_id")
    .optional()
    .isInt()
    .withMessage("L'ID de l'offre doit être un entier"),
    
    body("titre")
        .optional()
        .trim()
        .isString()
        .withMessage("Le titre doit être une chaîne de caractères")
        .isLength({ min: 3, max: 200 })
        .withMessage("Le titre doit contenir entre 3 et 100 caractères"),
    
    body("description")
        .optional()
        .trim()
        .isString()
        .withMessage("La description doit être une chaîne de caractères")
        .isLength({ min: 10, max: 255 })
        .withMessage("La description doit contenir entre 10 et 500 caractères"),
    
    body("type")
        .optional()
        .isIn([TypeProcessus.QUESTIONNAIRE,TypeProcessus.TACHE,TypeProcessus.VISIO_CONFERENCE])
        .withMessage("Le type doit être VISIO_CONFERENCE, TACHE ou QUESTIONNAIRE"),
    
    body("statut")
        .optional()
        .isIn([StatutProcessus.A_VENIR, StatutProcessus.EN_COURS, StatutProcessus.TERMINER, StatutProcessus.ANNULER])
        .withMessage("Le statut doit être A_VENIR, EN_COURS, TERMINE ou ANNULE"),
    
    body("duree")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La durée doit être un nombre entier positif en minutes"),
    
    body("lien_visio")
        .optional({ nullable: true })
        .isURL()
        .withMessage("Le lien visio doit être une URL valide")
];

module.exports = { createProcessusValidator, updateProcessusValidator };