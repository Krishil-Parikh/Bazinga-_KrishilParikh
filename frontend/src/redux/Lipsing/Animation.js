import { createSlice } from "@reduxjs/toolkit";

const Animation = createSlice({
    name:"animation",
    initialState:{
        animation:"",
        facialExperssion:"",
    },
    reducers:{
        updateAnimationField : (state, actions)=>{
            const {field, value} = actions.payload;
            state[field] = value;
        }
    }
})

export const {updateAnimationField} = Animation.actions;
export default Animation.reducer;