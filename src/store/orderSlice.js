import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
    name: "orders",
    initialState: {
        orders: [],
        loading: false,
        error: null,
        currentOrder: null,
    },
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
            state.loading = false;
        },
        updateOrderStatus: (state, action) => {
            const { id, status } = action.payload;
            const index = state.orders.findIndex((o) => o.id === id);
            if (index !== -1) {
                state.orders[index].status = status;
            }
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
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

export const { setOrders, updateOrderStatus, setCurrentOrder, setLoading, setError } = orderSlice.actions;

export default orderSlice.reducer;
