// ============================================================
// IMPORT REQUIRED MODELS & LIBRARIES
// ============================================================

import Profile from "../models/profile.model.js"; // Profile model (not used yet here)
import User from "../models/user.model.js"; // User model
import Post from "../models/post.model.js"; // Post model
import bcrypt from "bcrypt"; // For password hashing (not used here)
import Comment from "../models/comments.model.js";
// import cloudinary from './utils/cloudinary.js'
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

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

  const { token } = req.body;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    // upload the file on cloudinary
    const filePath = path.resolve(req.file.path);
    const response = await cloudinary.uploader.upload(filePath, {
      folder: "posts",
      resource_type: "auto"
    })
    // file has been uploaded successfully
    console.log("File uploaded successfully", response);

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: response.url || null,
    });
    await post.save();
    fs.unlinkSync(req.file.path);
    return res.status(200).json({ success: true, post });

  } catch (error) {

    fs.unlinkSync(req.file.path);// Remove the locally saved temporary file as the upload operation got failed
    return res.status(500).json({ success: false, message: "File upload failed", error: error.message });
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

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    // Find user by token and ensure _id is selected
    const user = await User.findOne({ token: token }).select("_id");
    if (!user || !user._id) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find post by id
    const post = await Post.findById(post_id);
    if (!post || !post.userId) {
      return res.status(404).json({ success: false, message: "Post not found or invalid" });
    }

    // Check if post belongs to user
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // If media exists, delete from Cloudinary
    if (post.media) {
      try {
        console.log("Post media URL:", post.media);
        const segments = post.media.split('/');
        const folder = segments[segments.length - 2];
        const filenameWithExtension = segments[segments.length - 1];
        const publicId = `${folder}/${filenameWithExtension.split('.')[0]}`;

        console.log("Full publicId to delete:", publicId);

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        console.log("Cloudinary deletion result:", result);
      } catch (cloudErr) {
        console.error("Cloudinary deletion error:", cloudErr);
      }
    }

    // Delete the post from database
    await Post.deleteOne({ _id: post_id });

    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ============================================================
// ADD A COMMENT TO A POST
// ============================================================
export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    console.log("Creating post comment for post:", post_id)
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

  try {
    const post = await Post.findOne({ _id: post_id });
    


    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await Comment
      .find({ postId: post_id })
      .populate(
        "userId",
        "username name profilePicture"
      );
    console.log("Comments found:", comments.length)
    
    return res.status(202).json({
      post_id:post_id,
      comments: comments.reverse(),
      profilePicture: comments.userId?.profilePicture || ""
    });
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
    // Validate user
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Find comment
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete
    await Comment.deleteOne({ _id: comment_id });
    return res.json({ success: true, message: "Comment Deleted" });
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
      return res.status(404).json({ message: "Post not found" });
    }

    // Increase like count
    post.likes = post.likes + 1;

    await post.save();

    return res.json({ comments: "likes incremented" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};