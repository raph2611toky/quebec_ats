require('dotenv').config();
const express = require("express");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const morgan = require('morgan');
const cors = require('cors');

const userRoutes = require("./routes/user.routes")
const offreRoutes = require("./routes/offre.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.use("/api/users", userRoutes)
app.use("/api/offres", offreRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.send("Bienvenue dans l'api rest pour une application ATS de Quebec.");
});

module.exports = app;
