// ============================================================
// IMPORT REQUIRED MODULES
// ============================================================
import { Router } from "express";
import multer from "multer"; // For handling file uploads

import { 
    activeCheck,
    createPost,
    getAllPosts,
    deletePost,
    commentPost,
    get_comments_by_post,
    delete_comment_of_user,
    increment_likes,
} from "../controllers/posts.controller.js";

// ============================================================
// MULTER CONFIGURATION – MEMORY STORAGE
// ============================================================
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage: storage });

// ============================================================
// CREATE ROUTER
// ============================================================
const router = Router();

// ============================================================
// ROUTES
// ============================================================

// Server health check
router.route('/').get(activeCheck);

// Create post (with file upload handled in memory)
router.post("/post", upload.single("media"), createPost);

// Fetch all posts
router.get("/posts", getAllPosts);

// Delete a post
router.delete("/delete_post", deletePost);

// Add a comment
router.post("/comment", commentPost);

// Get comments by post
router.get("/get_comments", get_comments_by_post);

// Delete a comment
router.route("/delete_comment").delete(delete_comment_of_user);

// Increment likes on a post
router.route("/increment_post_like").post(increment_likes);

// ============================================================
// EXPORT ROUTER
// ============================================================
export default router;
