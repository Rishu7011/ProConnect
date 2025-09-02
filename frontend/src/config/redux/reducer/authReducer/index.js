// Import async thunk actions (used for API calls and async operations)
import {
  getAboutUser,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequests,
  loginUser,
  registerUser,
} from "@/config/redux/action/authAction";

// Redux Toolkit helper to create reducers + actions in one place
import { createSlice } from "@reduxjs/toolkit";

// -------------------------
// Initial state of auth slice
// -------------------------
const initialState = {
  user: undefined,
  // profile: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};


// -------------------------
// Auth Slice (manages auth state & reducers)
// -------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reset auth state completely back to initial
    reset: () => initialState,

    // Example reducer just to test state change
    handleLoginUser: (state) => {
      state.message = "hello";
    },

    // Clear out any existing messages (reset message state)
    EmptyMessage: (state) => {
      state.message = "";
    },

    // Mark that token is available (user session exists)
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },

    // Mark that token is NOT available (user logged out / expired)
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  // -------------------------
  // Extra reducers for handling async thunk actions
  // -------------------------
  extraReducers: (builder) => {
    builder
      // -------------------------
      // LOGIN USER
      // -------------------------
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door ..."; // Loading message
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true; // User successfully logged in
        state.message = "login is successfull";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Store error message
      })

      // -------------------------
      // REGISTER USER
      // -------------------------
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you ..."; // Loading message
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false; // After register, user must login
        state.message = {
          message: "registired is successfull,please log in",
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Store error message
      })

      // -------------------------
      // GET ABOUT USER (fetch logged-in user's profile + details)
      // -------------------------
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;         // Mark profile as fetched
        state.user = action.payload.profile;    // Save user data
      })

      // -------------------------
      // GET ALL USERS (fetch all user profiles from backend)
      // -------------------------
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_users = action.payload.profiles; // Backend returns {profiles}
        state.all_profiles_fetched = true;         // Mark as fetched
      })
      .addCase(getConnectionRequest.fulfilled, (state, action)=>{
        state.connections = action.payload
      })
      .addCase(getConnectionRequest.rejected, (state, action)=>{
        state.message = action.payload
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) =>{
        state.connectionRequest = action.payload
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) => {
        state.message = action.payload
      });
  },
});

// Export reducers (actions) to use in components
export const { reset, EmptyMessage, setTokenIsNotThere, setTokenIsThere} =
  authSlice.actions;

// Export reducer to configure in store
export default authSlice.reducer;
