import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
    name:"userStates",
    initialState:{
        name:"",
        email:"",
        username:"",
    },
    reducers:{
        changeUserDetails:(state, actions)=>{
            return actions.payload;
        }
    }
});

export const {changeUserDetails} = UserSlice.actions;
export default UserSlice.reducer;