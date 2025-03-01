import { createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

const initialState = {
  notifications: [
    {
      id: 1,
      type: "emergency",
      message: "Patient P-5001 condition changed to Critical",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "queue",
      message: "New patient added to queue: Emily Johnson",
      time: "15 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "discharge",
      message: "Discharge approval needed for patient P-4023",
      time: "30 minutes ago",
      read: true,
    },
  ],
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || "info",
        time: new Date().toLocaleTimeString(),
        read: false,
      })
    },
    notifyEmergency: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        message: `Emergency Alert: ${action.payload}`,
        type: "emergency",
        time: new Date().toLocaleTimeString(),
        read: false,
      })
    },
    notifyNewPatient: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        message: `New Patient Admitted: ${action.payload}`,
        type: "queue",
        time: new Date().toLocaleTimeString(),
        read: false,
      })
    },
    notifyDischarge: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        message: `Patient Discharged: ${action.payload}`,
        type: "discharge",
        time: new Date().toLocaleTimeString(),
        read: false,
      })
    },
    markAsRead: (state, action) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload)
      if (index !== -1) {
        state.notifications[index].read = true
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true
      })
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  addNotification,
  notifyEmergency,
  notifyNewPatient,
  notifyDischarge,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer