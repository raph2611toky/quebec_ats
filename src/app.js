require('dotenv').config();
const express = require("express");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const morgan = require('morgan');
const cors = require('cors');
const path = require("path");

const userRoutes = require("./routes/user.routes")
const offreRoutes = require("./routes/offre.routes");
const candidats = require("./routes/candidat.routes")
const postulations = require("./routes/postulation.routes")
const referents = require("./routes/referent.routes")
const notifications = require("./routes/notification.routes")
const processusRoute = require("./routes/processus.routes")
const questionRoute = require("./routes/question.route")
const reponseRoute = require("./routes/reponse.routes")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res, next) => {
    req.base_url = `${req.protocol}://${req.get("host")}`;
    next();
});

app.use("/api/reponses", reponseRoute)
app.use("/api/questions", questionRoute)
app.use("/api/processus", processusRoute)
app.use("/api/users", userRoutes)
app.use("/api/offres", offreRoutes);
app.use("/api/candidats", candidats)
app.use("/api/postulations", postulations)
app.use("/api/referents", referents)
app.use("/api/notifications", notifications)

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.send("Bienvenue dans l'api rest pour une application ATS de Quebec.");
});

module.exports = app;
