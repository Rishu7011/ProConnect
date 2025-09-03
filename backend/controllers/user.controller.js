// ================================================
// IMPORTING REQUIRED MODULES & MODELS
// ================================================
import { v2 as cloudinary } from "cloudinary";

// configure with your credentials
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
import axios from "axios";

import User from "../models/user.model.js"; // Import the User model
import bcrypt from "bcrypt"; // For hashing passwords securely
import crypto from "crypto"; // For generating random tokens
import PDFDocument from "pdfkit"; // To dynamically create PDF files
import fs from "fs"; // Node.js File System module for reading/writing files
import ConnectionRequest from "../models/connection.model.js";
import Profile from "../models/profile.model.js";


// ================================================
// FUNCTION: Convert user profile data into a PDF file
// ================================================
const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputpath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputpath);
  doc.pipe(stream);

  try {
    if (userData.userId.profilePicture) {
      // Download the Cloudinary image as a buffer
      const response = await axios.get(userData.userId.profilePicture, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");

      // Insert into PDF
      doc.image(buffer, {
        align: "center",
        width: 100,
      });
    }
  } catch (err) {
    console.error("Error loading profile picture:", err.message);
  }

  // Add user details
  doc.moveDown();
  doc.fontSize(14).text(`Name : ${userData.userId.username}`);
  doc.fontSize(14).text(`Email : ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio : ${userData.bio}`);
  doc.fontSize(14).text(`Current Position : ${userData.currentPost}`);

  // Work history
  doc.fontSize(14).text("Past Work :");
  userData.pastWork.forEach((work) => {
    doc.fontSize(14).text(`Company : ${work.company}`);
    doc.fontSize(14).text(`Position : ${work.position}`);
    doc.fontSize(14).text(`Years : ${work.years}`);
  });

  doc.end();
  return outputpath;
};

// ==============================
// REGISTER A NEW USER
// ==============================
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();

    // Create an empty profile linked to the user
    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    // Success response
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({ message: error.message });
  }
};

// ==============================
// LOGIN A USER
// ==============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All  are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Compare given password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a random token (used for session-like behavior)
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { $set: { token } });

    // Return token to the client
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==============================
// UPLOAD PROFILE PICTURE
// ==============================
export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
      use_filename: true,
      unique_filename: false,
    });

    // Save Cloudinary URL instead of local filename
    user.profilePicture = result.secure_url;
    await user.save();

    return res.json({
      message: "profile picture updated",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// ==============================
// UPDATE USER PROFILE
// ==============================
export const updateUserProfile = async (req, res) => {
  try {
    // Extract token and other updated fields from the request body
    const { token, ...newUserData } = req.body;

    // Find user by token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if new username or email is already in use
    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: "user already exist" });
    }

    // Update user fields with new data
    Object.assign(user, newUserData);
    await user.save();

    return res.json({ message: "user updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==============================
// GET USER PROFILE WITH DETAILS
// ==============================
export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    console.log(`token:${token}`);

    // Find user by token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Token invalid or user not found" });
    }
    console.log(user);

    // Find profile linked to the user and also include specific user details
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    // Return profile data
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// UPDATE PROFILE DATA (bio, work history, etc.)
// ================================================
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    // Find the user via token
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find profile document linked to this user
    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    // Merge new data into the existing profile
    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// GET ALL USERS' PROFILES
// ================================================
export const getAllUsersProfile = async (req, res) => {
  try {
    // Retrieve all profiles and populate basic user details
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ profiles: profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// GENERATE & RETURN A USER'S PROFILE AS A PDF FILE
// ================================================
export const downloadProfile = async (req, res) => {
  // Extract the user ID from query params
  const user_id = req.query.id;

  // Get profile data and linked user details
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name username email profilePicture"
  );

  // Generate the PDF from the user's profile
  let outputpath = await convertUserDataToPDF(userProfile);

  // Send back a JSON response with the generated PDF's file name
  return res.json({ message: "PDF generated", file: outputpath });
};

// ================================================
// SEND CONNECTION REQUEST
// ================================================
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(connectionId)
    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Prevent duplicate requests
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      console.log("Connection request already exists");
      return res.status(400).json({ message: "Request already sent" });
    }


    const request = new ConnectionRequest({ userId: user._id, connectionId });
    await request.save();

    return res.json({ message: "Request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// GET CONNECTION REQUESTS I SENT
// ================================================
export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// GET CONNECTION REQUESTS I RECEIVED
// ================================================
export const WhatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================================================
// ACCEPT OR REJECT A CONNECTION REQUEST
// ================================================
export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findById(requestId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    }
    else {
      connection.status_accepted = false;
    }

    await connection.save();

    return res.json({ message: "Request updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getUserProfileAndUserBasedOnUserName = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate("userId", "name username email profilePicture");

    return res.json({ "profile": userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};