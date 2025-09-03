import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPi) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPi.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPi.rejectWithValue(err.response.data);
    }
  }
);

// =====================
// Create Post (with Cloudinary upload handled on backend)
// =====================
export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body, token } = userData;

    try {
      const formData = new FormData();
      // Match backend field name
      formData.append("media", file);
      // Match backend body field name
      formData.append("body", body);
      formData.append("token", token);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const profilePicture = createAsyncThunk(
  "post/profilePicture",
  async (userData, thunkAPI) => {
    const { file,token } = userData;
    try {
      const formData = new FormData();
      // Match backend field name
      formData.append("profilePicture", file);
      // Match backend body field name
      formData.append("token", token);

      const response = await clientServer.post("/update_profile_picture", formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          post_id: post_id.post_id,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementPostLike",
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.post("/increment_post_like", {
        post_id: post.post_id,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: {
          post_id: postData.post_id,
        },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data,
        // post_id: postData.post_id,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching comments"
      );
    }
  }
);

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      console.log({
        post_id: commentData.post_id,
        body: commentData.body
      });
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id: commentData.post_id,
        commentBody: commentData.body, // ✅ match the field
      });

      // backend gives { success, message, comment }
      return thunkAPI.fulfillWithValue(
        // post_id: commentData.post_id,
        // comment: response.data.comment, // ✅ only the new comment
       response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error posting comment"
      );
    }
  }
);
