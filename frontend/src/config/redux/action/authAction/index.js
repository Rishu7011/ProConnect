import { createAsyncThunk } from "@reduxjs/toolkit"; // Import createAsyncThunk for creating async Redux actions
import { clientServer } from "@/config"; // Import Axios instance or server client configuration

// Async thunk for logging in a user
export const loginUser = createAsyncThunk(
  "user/login", // Action type string for Redux
  async (user, thunkAPI) => {
    // Async function that receives user data and thunkAPI
    try {
      // Make POST request to '/login' endpoint with user email and password
      const response = await clientServer.post(`/login`, {
        email: user.email,
        password: user.password,
      });

      // If server returns a token
      if (response.data.token) {
        // Store token in localStorage for session persistence
        localStorage.setItem("token", response.data.token);
      } else {
        // If token is not provided, reject the thunk with a custom message
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }

      // Return token as fulfilled value to update Redux state
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      // If error occurs (e.g., invalid credentials), reject thunk with error data
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const otpSend = createAsyncThunk(
  "user/otpSend",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(`/send_otp`, {
        email: user.email,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for registering a new user
export const registerUser = createAsyncThunk(
  "user/register", // Action type string for Redux
  async (user, thunkAPI) => {
    // Async function that receives user registration data
    try {
      
      // Make POST request to '/register' endpoint with user details
      const response = await clientServer.post(`/register`, {
        email: user.email,
        password: user.password,
        username: user.username,
        name: user.name,
        Userotp: user.otp
      });

      // Return token as fulfilled value to update Redux state
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      // If error occurs (e.g., email already exists), reject thunk with error data
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    // We don't need any arguments, so use '_'
    try {
      const token = localStorage.getItem("token"); // ✅ Get token directly

      if (!token) {
        return thunkAPI.rejectWithValue({ message: "No token found" });
      }
      const response = await clientServer.get("/get_user_and_profile", {
        params: { token: user.token }, // ✅ Use the token from localStorage
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_User");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      console.log(user.user_id)
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          connectionId: user.user_Id,
        }
      );
      console.log("hii")
      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequest", {
        params: { token: user.token },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: { token: user.token },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user,thunkApi)=>{
    try{
      const response = await clientServer.post("/user/accept_connection_request",{
        token:user.token,
        requestId:user.connectionId,
        action_type:user.action
      });
      thunkApi.dispatch(getMyConnectionRequests({ token: user.token }));
      thunkApi.dispatch(getConnectionRequest({ token: user.token }));
      return thunkApi.fulfillWithValue(response.data);
    } catch(error){
      return thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

/**
 * Redux Toolkit Async Thunks for User Authentication
 *
 * loginUser:
 * - Handles user login by sending email and password to the server.
 * - Makes a POST request to '/login' with the user credentials.
 * - On success:
 *     - Saves the received token in localStorage.
 *     - Returns the token using fulfillWithValue to update Redux state.
 * - On failure:
 *     - If no token is returned or an error occurs, rejectWithValue sends the error to Redux.
 *
 * registerUser:
 * - Handles user registration by sending email, password, username, and name to the server.
 * - Makes a POST request to '/register' with the user details.
 * - On success:
 *     - Returns the token using fulfillWithValue to update Redux state.
 * - On failure:
 *     - rejectWithValue sends the error response to Redux.
 *
 * Notes:
 * - Both thunks use createAsyncThunk to handle async operations and automatically
 *   provide pending, fulfilled, and rejected states.
 * - thunkAPI.fulfillWithValue returns successful response data.
 * - thunkAPI.rejectWithValue propagates errors for state handling.
 */
