import { configureStore } from '@reduxjs/toolkit';
import SidebarReducer from "./SidebarSlice/SidebarSlice";
import UploadReducer from "./UploadSlice/UploadSlice";
import UserReducer from "./UserSlice/UserSlice";
import TranscriptReducer from "./Transcript/Transcript";
import NotingReducer from "./NotingSlice/NotingSlice";
import notificationReducer from "./NotificationSlice/NotificationSlice";


const store = configureStore({
    reducer:{
        sidebar : SidebarReducer,
        upload : UploadReducer,
        user : UserReducer,
        notifications: notificationReducer,
        transcript:TranscriptReducer,
        noting:NotingReducer,
    },
});

export default store;