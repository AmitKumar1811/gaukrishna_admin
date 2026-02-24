import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
    name: "categories",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload;
            state.loading = false;
        },
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        updateCategory: (state, action) => {
            const index = state.categories.findIndex((cat) =>
                (cat.id === action.payload.id || cat._id === action.payload._id)
            );
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        },
        deleteCategory: (state, action) => {
            state.categories = state.categories.filter((cat) =>
                (cat.id !== action.payload && cat._id !== action.payload)
            );
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

export const { setCategories, addCategory, updateCategory, deleteCategory, setLoading, setError } = categorySlice.actions;

export default categorySlice.reducer;
