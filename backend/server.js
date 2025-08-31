// Import required modules
import express from "express";  // Express framework for building REST APIs
import cors from "cors";        // Middleware to allow cross-origin requests
import dotenv from "dotenv";    // To load environment variables from a .env file
import {mongoose} from "mongoose"; // MongoDB ODM (Object Data Modeling)
import postroutes from "./routes/post.routes.js";  // Routes for post-related APIs
import userroutes from "./routes/user.route.js";   // Routes for user-related APIs

// Load environment variables from .env file into process.env
dotenv.config();

// Create an Express application
const app = express();

// Middleware setup
app.use(cors());                 // Enable CORS for all routes
app.use(express.json());         // Parse incoming JSON requests
app.use(postroutes);             // Use all routes defined in post.routes.js
app.use(userroutes);             // Use all routes defined in user.route.js
app.use(express.static("uploads")); // Serve static files from "uploads" folder (e.g., images, documents)

// Function to connect to MongoDB and start the server
const start = async () => {
  try {
    // Connect to MongoDB (Atlas cluster in this case)
    const connectDB = await mongoose.connect(
      "mongodb+srv://negirishabh7011:zf2vuvoooliwKGDS@linkedinclone.o4vpiaz.mongodb.net/?retryWrites=true&w=majority&appName=LinkedinClone"
    );
    console.log("✅ MongoDB connected successfully");

    // Start Express server on port 9090
    app.listen(9090, () => {
      console.log("🚀 Server is running at http://localhost:9090");
    });

  } catch (error) {
    // Catch and log any connection errors
    console.error("❌ Error connecting to MongoDB:", error.message);
  }
};

// Call the start function
start();
