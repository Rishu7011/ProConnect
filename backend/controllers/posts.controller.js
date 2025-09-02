// ============================================================
// IMPORT REQUIRED MODELS & LIBRARIES
// ============================================================
import Profile from "../models/profile.model.js"; // Profile model (not used yet here)
import User from "../models/user.model.js"; // User model
import Post from "../models/post.model.js"; // Post model
import bcrypt from "bcrypt"; // For password hashing (not used here)
import Comment from "../models/comments.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // to remove local file after upload
import multer from "multer";
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// configure with your credentials
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
import axios from "axios";
import { response } from "express";
// ============================================================
// CHECK SERVER STATUS
// ============================================================
export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" }); // Health check endpoint
};

// ============================================================
// CREATE A POST
// ============================================================
export const createPost = async (req, res) => {
  try {
    const file = req.file; // multer gives this
    const { caption } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "File not found" });
    }

    // Upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "next-cloudinary-uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    // Save post in MongoDB
    const user = await User.findOne({ token: req.body.token }); // or req.user if using auth middleware
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const newPost = new Post({
      userId: user._id,
      caption,
      mediaUrl: result.secure_url,
      likes: 0,
    });

    await newPost.save();

    return res.status(200).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating post",
    });
  }
};



// ============================================================
// GET ALL POSTS (with user info populated)
// ============================================================
export const getAllPosts = async (req, res) => {
  try {
    // Fetch posts and also include basic user info
    
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    console.log("Fetching all posts...");
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// DELETE A POST
// ============================================================
export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    // Find user by token
    const user = await User.findOne({ token: token }).select("id");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // Find post by id
    const post = await Post.deleteOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    // Check if post belongs to user
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete post
    await Post.deletePost({ _id: post_id });
    return res.json({ message: "post" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// ADD A COMMENT TO A POST
// ============================================================
export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    // Validate user by token
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // Validate post existence
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    console.log("Creating comment...");
    // Create and save new comment
    const comment = new Comment({
      userId: user._id,
      postId: req.body.post_id,  // ✅ match schema
      body: req.body.commentBody,
    });

    await comment.save();

    return res.status(202).json({ message: "Comment Added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// GET COMMENTS FOR A SPECIFIC POST
// ============================================================
export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;
  console.log("Fetching comments for post:", post_id);
  try {
    const post = await Post.findOne({ _id: post_id });
    console.log("post_id from query:", req.query.post_id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await Comment
    .find({ postId: post_id })
    .populate(
      "userId",
      "username name"
    );
    console.log("Comments found:", comments.length)
    return res.status(202).json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// DELETE A COMMENT
// ============================================================
export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;
  try {
    // Validate user (⚠️ currently querying Post with token, probably should query User)
    const token = await Post.findOne({ token: token }).select("_id");
    if (!token) {
      return res.status(401).json({ message: "User not found" });
    }

    // Find comment by ID
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(500).json({ message: "comment not found" });
    }

    // Ensure the comment belongs to the user
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "UUnauthorized" });
    }

    // Delete comment
    await Comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// INCREMENT POST LIKES
// ============================================================
export const increment_likes = async (req, res) => {
  const { post_id } = req.body;
  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(500).json({ message: "Post not found" });
    }

    // Increase like count
    post.likes = post.likes + 1;

    await post.save();

    return res.json({ comments: "likes incremented" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
