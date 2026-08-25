import { createSlice } from "@reduxjs/toolkit";

const couponSlice = createSlice({
    name: "coupons",
    initialState: {
        coupons: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCoupons: (state, action) => {
            state.coupons = action.payload;
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

export const { setCoupons, setLoading, setError } = couponSlice.actions;
export default couponSlice.reducer;
