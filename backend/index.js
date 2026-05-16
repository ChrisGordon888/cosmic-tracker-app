/**
 * ================================
 * 🌌 Cosmic Tracker Backend Server
 * - Express + Apollo GraphQL API
 * - Verifies NextAuth JWT token from Authorization header
 * - Connects to MongoDB with Mongoose
 * ================================
 */

require("dotenv").config();

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const typeDefs = require("./schemas");
const resolvers = require("./resolvers");

// Catch hidden startup/runtime crashes so Render prints the real reason.
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
    process.exit(1);
});

const allowedOrigins = [
    "http://localhost:3000",
    "https://studio.apollographql.com",
    "https://studio-ui-deployments.apollographql.com",
    process.env.FRONTEND_URL,
].filter(Boolean);

function logStartupConfig() {
    const mongoUri = process.env.MONGODB_URI || "";

    console.log("🔎 Startup config check:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Node version:", process.version);
    console.log("FRONTEND_URL exists:", Boolean(process.env.FRONTEND_URL));
    console.log("NEXTAUTH_SECRET exists:", Boolean(process.env.NEXTAUTH_SECRET));
    console.log("MONGODB_URI exists:", Boolean(process.env.MONGODB_URI));
    console.log(
        "MONGODB_URI starts with mongodb+srv:",
        mongoUri.startsWith("mongodb+srv://")
    );

    if (mongoUri.includes("@")) {
        console.log("Mongo target:", mongoUri.split("@")[1]);
    }
}

async function startServer() {
    logStartupConfig();

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing");
    }

    if (!process.env.NEXTAUTH_SECRET) {
        throw new Error("NEXTAUTH_SECRET is missing");
    }

    const app = express();

    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    );

    app.get("/", (req, res) => {
        res.send("Cosmic Tracker API is running.");
    });

    app.get("/health", (req, res) => {
        res.json({ status: "ok" });
    });

    try {
        console.log("🔌 Attempting MongoDB connection...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error message:", error.message);
        console.error("❌ MongoDB connection stack:", error.stack);
        console.error("❌ MongoDB connection full error:", error);
        process.exit(1);
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || "";

            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : null;

            if (!token) {
                return { user: null };
            }

            try {
                const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
                const User = require("./models/User");

                let user = await User.findOne({ email: decoded.email });

                if (!user) {
                    user = await User.create({
                        email: decoded.email,
                        name:
                            decoded.name ||
                            decoded.email?.split("@")[0] ||
                            "Cosmic Traveler",
                        image: decoded.picture || null,
                        level: 1,
                        xp: 0,
                        xpToNextLevel: 100,
                        currentRealm: 303,
                        unlockedRealms: [303, 202],
                        completedTrials: [],
                        visitedLocations: [],
                        musicStats: {
                            tracksListened: [],
                            totalListeningTime: 0,
                            totalTracksUnlocked: 6,
                        },
                        streaks: {
                            currentStreak: 0,
                            longestStreak: 0,
                            lastLoginDate: new Date(),
                            totalLogins: 1,
                        },
                    });
                }

                return {
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                    },
                };
            } catch (error) {
                console.error("❌ JWT verification failed:", error.message);
                return { user: null };
            }
        },
    });

    await server.start();
    server.applyMiddleware({ app, path: "/graphql" });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
}

startServer().catch((error) => {
    console.error("❌ startServer failed:", error);
    process.exit(1);
});