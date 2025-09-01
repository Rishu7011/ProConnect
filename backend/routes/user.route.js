import { Router } from 'express'; // Import Express Router for creating route handlers
import {
  register,
  login,
  updateUserProfile,
  uploadProfilePicture,
  getUserAndProfile,
  updateProfileData,
  getAllUsersProfile,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionRequest,
  WhatAreMyConnections,
  acceptConnectionRequest,
  getUserProfileAndUserBasedOnUserName
} from "../controllers/user.controller.js"; // Import controller functions
// Create an Express Router instance
const router = Router();



// ==============================
// ROUTES
// ==============================

// Route for uploading a profile picture
router.route("/update_profile_picture")
  .post(uploadProfilePicture);

// Route for registering a new user
router.route('/register').post(register);

// Route for logging in a user
router.route('/login').post(login);

// Route for updating user profile (other than profile picture)
router.route("/user_update").post(updateUserProfile);

// Route for getting both user details and profile info
router.route('/get_user_and_profile').get(getUserAndProfile);

// Route for updating specific profile data fields
router.route("/update_profile_data").post(updateProfileData);

// Route for retrieving the profile information of all users
router.route("/user/get_all_User").get(getAllUsersProfile);

// Route for downloading the user's profile/resume as a PDF
router.route("/user/download_resume").get(downloadProfile);

router.route("/user/send_connection_request").post(sendConnectionRequest)

router.route("/user/getConnectionRequest").get(getMyConnectionRequest)
router.route("/user/user_connection_request").get(WhatAreMyConnections)
router.route("/user/accept_connection_request").post(acceptConnectionRequest)
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUserName)

// Export the router to be used in the main app
export default router;
