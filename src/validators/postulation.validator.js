const { body, param } = require("express-validator");

const validateRemarque = [
    body("text")
    .notEmpty()
    .withMessage("Le champ text est requis")
    .isLength({ min: 2, max: 255 })
    .withMessage("Le titre doit être entre 2 et 255 caractères")

]


module.exports = {
    validateRemarque
};