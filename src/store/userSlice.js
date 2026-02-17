import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loading: false,
        error: null,
        totalUsers: 0,
        page: 1,
        limit: 10,
    },
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload.users;
            state.totalUsers = action.payload.total;
            state.loading = false;
        },
        setPage: (state, action) => {
            state.page = action.payload;
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

export const { setUsers, setPage, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;
