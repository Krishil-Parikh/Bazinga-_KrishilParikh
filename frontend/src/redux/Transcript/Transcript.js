import { createSlice } from "@reduxjs/toolkit";

const Transcript = createSlice({
    name:'transcript',
    initialState:"",
    reducers:{
        updateTranscript:(state, actions)=>{
            return actions.payload;
        }
    }
})

export const {updateTranscript} = Transcript.actions;
export default Transcript.reducer;