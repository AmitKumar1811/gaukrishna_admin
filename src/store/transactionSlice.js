import { createSlice } from "@reduxjs/toolkit";

const transactionSlice = createSlice({
    name: "transactions",
    initialState: {
        transactions: [],
        loading: false,
        error: null,
    },
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
            state.loading = false;
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

export const { setTransactions, setLoading, setError } = transactionSlice.actions;

export default transactionSlice.reducer;
