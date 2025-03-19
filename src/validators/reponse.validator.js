const { body,param } = require("express-validator");

const createReponseValidator =     [
    body("label").
    trim()
    .notEmpty()
    .withMessage("Le libellé est requis")
    .isLength({ max: 255 })
    .withMessage("Le libellé ne doit pas dépasser 255 caractères"),
    
    body("is_true")
    .isBoolean()
    .withMessage("is_true doit être un booléen"),
    
    body("question_id")
    .isInt()
    .withMessage("L'ID de la question doit être un entier"),
];

const updateResponseValidator =     [
    param("id")
    .isInt()
    .withMessage("L'ID doit être un entier"),
    
    body("label")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Le libellé ne doit pas dépasser 255 caractères"),
    
    body("is_true")
    .optional()
    .isBoolean()
    .withMessage("is_true doit être un booléen"),

];

module.exports = {
    createReponseValidator,
    updateResponseValidator
};
