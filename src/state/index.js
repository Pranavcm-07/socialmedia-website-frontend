import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUpdatedUser: (state, action) => {
      const updatedUserPicturePath = action.payload.updatedUser.picturePath;
      state.user.picturePath = updatedUserPicturePath;
    },
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setDeletePost: (state, action) => {
      const updatedPost = state.posts.filter((post) => {
        return post._id !== action.payload.post._id;
      });
      state.posts = updatedPost;
    },
  },
});

export const {
  setUpdatedUser,
  setMode,
  setLogin,
  setLogout,
  setFriends,
  setPosts,
  setPost,
  setDeletePost,
} = authSlice.actions;
export default authSlice.reducer;
