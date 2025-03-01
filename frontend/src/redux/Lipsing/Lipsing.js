import { createSlice } from "@reduxjs/toolkit";

const Lipsing = createSlice({
    name:"lipsing",
    initialState:[],
    reducers:{
        updateLipsingContent: (state,actions)=>{
            return actions.payload;
        }
    }
})

export const {updateLipsingContent} = Lipsing.actions;
export default Lipsing.reducer