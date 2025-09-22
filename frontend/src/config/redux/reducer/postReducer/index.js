import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts, postComment } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isloading: false,
  loggedIn: false,
  message: "",
  comments: [],   // store comments per post (postId -> array of comments)
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // === GET ALL POSTS ===
      .addCase(getAllPosts.pending, (state) => {
        state.isloading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isloading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isloading = false;
        state.isError = true;
        state.posts = action.payload?.posts || [];
      })

      // === GET COMMENTS ===
      .addCase(getAllComments.fulfilled, (state, action) => {
        // const { comments, post_id } = action.payload;
        // state.comments[post_id] = comments; // save comments per post
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments;
        state.profilePicture = action.payload.profilePicture || "";
        // state.isError = false;
      });
      },
});

export const { reset, resetPostId } = postSlice.actions;

export default postSlice.reducer;


