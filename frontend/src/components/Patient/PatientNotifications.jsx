"use client"

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  markAllAsRead,
  markAsRead,
  notifyEmergency,
  notifyNewPatient,
  notifyDischarge,
} from "@/redux/NotificationSlice/NotificationSlice"

export const usePatientNotifications = () => {
  const dispatch = useDispatch();
  return {
    notifyEmergency: (message) => dispatch(notifyEmergency(message)),
    notifyDischarge: (message) => dispatch(notifyDischarge(message)),
  };
};

export default function PatientNotifications() {
  const dispatch = useDispatch()
  const notifications = useSelector((state) => state.notifications.notifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto text-xs px-2" onClick={() => dispatch(markAllAsRead())}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start py-2 px-4 ${notification.read ? "" : "bg-muted/50"}`}
              onClick={() => dispatch(markAsRead(notification.id))}
            >
              <div className="flex items-center w-full">
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    notification.type === "emergency"
                      ? "bg-red-500"
                      : notification.type === "queue"
                        ? "bg-blue-500"
                        : "bg-green-500"
                  }`}
                />
                <span className="font-medium flex-1">{notification.message}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-4 mt-1">{notification.time}</div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
