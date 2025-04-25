require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");

// Routes imports
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const imageRoutes = require("./routes/image");

const setupAssociations = require("./models/associations");

// Setup associations before syncing
setupAssociations();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true
}));

// Create a router for /photobooth-api path
const router = express.Router();

// Swagger UI setup
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocs, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Static file serving
router.use("/uploads", express.static("uploads/images"));

// API Routes
router.use("/api/auth", authRoutes);
router.use("/api/payment", paymentRoutes);
router.use("/api/images", imageRoutes);

// Root path handler
router.get("/", (req, res) => {
    res.redirect("./api-docs");
});

// Mount all routes under /photobooth-api
app.use("/photobooth-api", router);

// Database sync and server start
sequelize.sync({ force: false })
    .then(() => {
        console.log("Database synchronized");
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Swagger documentation available at https://akbtrans.web.id/photobooth-api/api-docs`);
        });
    })
    .catch(err => {
        console.error("Failed to sync database:", err);
    });

module.exports = app;
