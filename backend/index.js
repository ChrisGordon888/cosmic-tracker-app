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

async function startServer() {
  const app = express();
  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || "";
      console.log("🚀 [Context] Authorization header received:", authHeader);

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

      if (!token) {
        console.log("🚫 No JWT token received or malformed Authorization header");
        return { user: null };
      }

      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        console.log("✅ JWT verified successfully in context:", decoded);

        return {
          user: {
            id: decoded.sub,
            email: decoded.email || null,
          },
        };
      } catch (error) {
        console.error("❌ JWT verification failed in context:", error.message);
        return { user: null };
      }
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();