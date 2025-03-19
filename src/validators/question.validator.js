const { body,param } = require("express-validator");


const createQuestionValidator= [
    body("label")
    .trim()
    .notEmpty()
    .withMessage("Le libellé est requis")
    .isLength({ max: 255 })
    .withMessage("Le libellé ne doit pas dépasser 255 caractères"),

    body("processus_id")
    .isInt()
    .withMessage("L'ID du processus doit être un entier"),
];


const idValidator =[
    param("id")
    .isInt()
    .withMessage("L'ID doit être un entier")
];

const updateQuestionValidator =     [
    param("id")
    .isInt()
    .withMessage("L'ID doit être un entier"),
    body("label")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Le libellé ne doit pas dépasser 255 caractères"),
    
    // body("processus_id").optional().isInt().withMessage("L'ID du processus doit être un entier"),
];

module.exports = {
    createQuestionValidator,
    idValidator,
    updateQuestionValidator
};
