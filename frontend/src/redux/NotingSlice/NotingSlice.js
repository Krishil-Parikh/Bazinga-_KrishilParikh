import { createSlice } from "@reduxjs/toolkit";

const initialState = []; // ✅ Ensure the initial state is an array

const NotingSlice = createSlice({
    name: "noting",
    initialState,
    reducers: {
        updateNotingSliceContent: (state, action) => {
            return [...state, action.payload]
        },
    },
});

export const { updateNotingSliceContent } = NotingSlice.actions;
export default NotingSlice.reducer;