const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

// Database Connection
const connectDB = require("./config/db");

// Swagger UI Documentation
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger");

// Route Handlers
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const chatRoutes = require("./routes/chatRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

// Sockets & Notifications
const initChatSocket = require("./sockets/chatSocket");
const { setSocketIO } = require("./utils/notifications");

// Error Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Initialize Express App & HTTP Server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Bind Socket.io to notifications and chat events
setSocketIO(io);
initChatSocket(io);

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Interactive Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "GigHub Freelance Marketplace Backend is running",
        documentation: "/api-docs",
        version: "1.0.0"
    });
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    const startServer = (port) => {
        const s = server.listen(port, () => {
            console.log(`========================================`);
            console.log(`GigHub Server running on http://localhost:${port}`);
            console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
            console.log(`========================================`);
        });

        s.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.warn(`[Port Conflict] Port ${port} is occupied (commonly macOS AirPlay Receiver).`);
                const nextPort = Number(port) + 1;
                console.log(`Switching automatically to port ${nextPort}...`);
                startServer(nextPort);
            } else {
                console.error("Server listen error:", err.message);
            }
        });
    };

    startServer(PORT);
}

module.exports = { app, server, io };