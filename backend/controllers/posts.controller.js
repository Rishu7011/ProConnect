// ============================================================
// IMPORT REQUIRED MODELS & LIBRARIES
// ============================================================
import Profile from "../models/profile.model.js"; // Profile model (not used yet here)
import User from "../models/user.model.js"; // User model
import Post from "../models/post.model.js"; // Post model
import bcrypt from "bcrypt"; // For password hashing (not used here)
import Comment from "../models/comments.model.js";

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

  try {
    // Verify user using token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new post object
    const post = new Post({
      userId: user._id,
      body: req.body.body, // Post content (text)
      media: req.file != undefined ? req.file.filename : "", // Uploaded file name if exists
      filetypes: req.file != undefined ? req.file.mimetype.split("/")[1] : "", // File type (e.g. jpg, png, mp4)
    });

    // Save post in DB
    await post.save();
    return res.status(200).json({ message: "post created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
