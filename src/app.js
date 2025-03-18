require('dotenv').config();
const express = require("express");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const morgan = require('morgan');
const cors = require('cors');

const publicationRoutes = require("./routes/publication.routes")
const userRoutes = require("./routes/user.routes")
const commentsRoutes = require("./routes/comment.routes")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.use("/api/publications", publicationRoutes);
app.use("/api/admins", userRoutes)
app.use("/api",commentsRoutes)


// Swagger docs api
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.send("Welcome to Toto Election API! Visit /api/docs for the API documentation.");
});

module.exports = app;
