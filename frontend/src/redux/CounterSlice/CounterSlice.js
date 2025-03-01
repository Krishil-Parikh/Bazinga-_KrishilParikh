import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: 0,
};

const yourSlice = createSlice({
    name: 'yourState',
    initialState,
    reducers: {
        increment: (state) => {
        state.value += 1;
        },
        decrement: (state) => {
        state.value -= 1;
        },
    },
});

export const { increment, decrement } = yourSlice.actions;
export default yourSlice.reducer;
