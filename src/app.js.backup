require('dotenv').config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const sequelize = require('./config/database');  // Add this line

// Routes imports
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const imageRoutes = require("./routes/image");

const setupAssociations = require('./models/associations');

// Setup associations before syncing
setupAssociations();

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Add status file serving for images
app.use('/uploads', express.static('uploads/images'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/images", imageRoutes);  

// Database sync and server start
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });