import { configureStore } from '@reduxjs/toolkit';
import SidebarReducer from "./SidebarSlice/SidebarSlice";
import UploadReducer from "./UploadSlice/UploadSlice";
import UserReducer from "./UserSlice/UserSlice";
import TranscriptReducer from "./Transcript/Transcript";
import LipsingReducer from "./Lipsing/Lipsing";
import AnimationReducer from "./Lipsing/Animation";
import NotingReducer from "./NotingSlice/NotingSlice";

const store = configureStore({
    reducer:{
        sidebar : SidebarReducer,
        upload : UploadReducer,
        user : UserReducer,
        transcript:TranscriptReducer,
        lipsing : LipsingReducer,
        animation : AnimationReducer,
        noting:NotingReducer
    },
});

export default store;