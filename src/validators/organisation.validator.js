const { body } = require("express-validator");
const Organisation = require("../models/organisation.model");
const User = require("../models/user.model");

const createOrganisationValidator = [
    body("nom")
        .trim()
        .notEmpty().withMessage("Le nom est requis")
        .isString().withMessage("Le nom doit être une chaîne de caractères")
        .isLength({ min: 3, max: 100 }).withMessage("Le nom doit contenir entre 3 et 100 caractères"),

    body("adresse")
        .optional()
        .trim()
        .isString().withMessage("L'adresse doit être une chaîne de caractères"),

    body("ville")
        .optional()
        .trim()
        .isString().withMessage("La ville doit être une chaîne de caractères"),
];

const updateOrganisationValidator = [
    body("nom")
        .optional()
        .trim()
        .isString().withMessage("Le nom doit être une chaîne de caractères")
        .isLength({ min: 3, max: 100 }).withMessage("Le nom doit contenir entre 3 et 100 caractères"),

    body("adresse")
        .optional()
        .trim()
        .isString().withMessage("L'adresse doit être une chaîne de caractères"),

    body("ville")
        .optional()
        .trim()
        .isString().withMessage("La ville doit être une chaîne de caractères"),
];