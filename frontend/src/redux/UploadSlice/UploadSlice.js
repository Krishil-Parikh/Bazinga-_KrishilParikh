import { createSlice } from "@reduxjs/toolkit";

const UploadSlice = createSlice({
    name:"uploadState",
    initialState:{},
    reducers:{
        changeTheFile: (state, actions) => {
            return actions.payload;
        }
    }
})

export const {changeTheFile} = UploadSlice.actions;
export default UploadSlice.reducer