import { createSlice } from "@reduxjs/toolkit";

const blogSlice = createSlice({
    name: "blogs",
    initialState: {
        blogs: [],
        loading: false,
        error: null,
        currentBlog: null, // For editing
    },
    reducers: {
        setBlogs: (state, action) => {
            state.blogs = action.payload;
            state.loading = false;
        },
        addBlog: (state, action) => {
            state.blogs.push(action.payload);
        },
        updateBlog: (state, action) => {
            const index = state.blogs.findIndex((b) => b.id === action.payload.id);
            if (index !== -1) {
                state.blogs[index] = action.payload;
            }
        },
        deleteBlog: (state, action) => {
            state.blogs = state.blogs.filter((b) => b.id !== action.payload);
        },
        setCurrentBlog: (state, action) => {
            state.currentBlog = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setBlogs, addBlog, updateBlog, deleteBlog, setCurrentBlog, setLoading, setError } = blogSlice.actions;

export default blogSlice.reducer;
