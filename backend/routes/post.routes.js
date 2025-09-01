// ============================================================
// IMPORT REQUIRED MODULES
// ============================================================
import { Router } from "express"; // Importing Router from Express for handling routes
import { 
    activeCheck,          // Controller function to check if server is active
    createPost,           // Controller function to create a new post
    getAllPosts,          // Controller function to fetch all posts
    deletePost,           // Controller function to delete a specific post
    commentPost,          // Controller function to add a comment to a post
    get_comments_by_post, // Controller function to get comments of a post
    delete_comment_of_user,       // Controller function to delete a specific comment
    increment_likes,       // Controller function to increment likes on a post
} from "../controllers/posts.controller.js";


// Create an Express router instance
const router = Router();





// ============================================================
// ROUTES
// ============================================================

// Test route to check if the server is active
router.route('/').get(activeCheck);

// Route for creating a post (supports file upload via multer)
router.route("/post").post(createPost);

// Route for fetching all posts
router.route("/posts").get(getAllPosts);

// Route for deleting a specific post
router.route("/delete_post").delete(deletePost);

// Route for adding a comment to a post
router.route("/comment").post(commentPost);

// Route for fetching comments of a specific post
router.route("/get_comments").get(get_comments_by_post);

// Route for deleting a specific comment
router.route("/delete_comment").delete(delete_comment_of_user);

// Route for incrementing likes on a post
router.route("/increment_post_like").post(increment_likes);


// ============================================================
// EXPORT ROUTER
// ============================================================
// Exporting router so it can be used in the main server file
export default router;
