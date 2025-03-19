const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quebec ATS API",
      version: "1.0.0",
      description: "API pour la gestion des offres, candidatures, et référents dans une application ATS au Québec."
    },
    servers: [
      {
        "url": "http://localhost:5000",
      },
      {
        "url": "https://quebec-ats-f66o.onrender.com",
      }
    ],
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  apis: ["./src/routes/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
