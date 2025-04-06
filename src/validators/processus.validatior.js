const { body } = require("express-validator");
const { TypeProcessus } = require("@prisma/client");

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
        .optional()
        .trim()
        .isString()
        .withMessage("La description doit être une chaîne de caractères"),
    
    body("type")
        .optional()
        .isIn([TypeProcessus.QUESTIONNAIRE,TypeProcessus.TACHE,TypeProcessus.VISIO_CONFERENCE])
        .withMessage("Le type doit être VISIO_CONFERENCE, TACHE ou QUESTIONNAIRE"),
    
    
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
        .withMessage("La description doit être une chaîne de caractères"),
    
    body("type")
        .optional()
        .isIn([TypeProcessus.QUESTIONNAIRE,TypeProcessus.TACHE,TypeProcessus.VISIO_CONFERENCE])
        .withMessage("Le type doit être VISIO_CONFERENCE, TACHE ou QUESTIONNAIRE"),
    
    
    body("lien_visio")
        .optional({ nullable: true })
        .isURL()
        .withMessage("Le lien visio doit être une URL valide")
];

module.exports = { createProcessusValidator, updateProcessusValidator };