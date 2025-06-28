require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");

const typeDefs = require("./schemas");
const resolvers = require("./resolvers");

async function startServer() {
    const app = express();
    app.use(cors());
  
    const server = new ApolloServer({
      typeDefs,
      resolvers,
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