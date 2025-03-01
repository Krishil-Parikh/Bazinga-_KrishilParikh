import { createSlice } from "@reduxjs/toolkit";

const val = JSON.parse(localStorage.getItem("visibility")) || false;

const SidebarSlice = createSlice({
    name:"sidebarVisibility",
    initialState:{
        visibility : val,
    },
    reducers:{
        changeVisibiltyOfSidebar : (state, actions) => {
            localStorage.setItem("visibility", JSON.stringify(actions.payload));
            state.visibility = actions.payload;
        }
    }
})

export const { changeVisibiltyOfSidebar } = SidebarSlice.actions;
export default SidebarSlice.reducer;