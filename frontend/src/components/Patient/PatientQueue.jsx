"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, UserPlus, Building } from "lucide-react"
import { addNotification } from "@/redux/NotificationSlice/NotificationSlice.jsx" // Import action

// Sample patient queue data
const queueData = [
  { id: "P-1001", name: "John Smith", symptoms: "Chest pain, shortness of breath", waitingTime: 45, priority: "High" },
  { id: "P-1002", name: "Emily Johnson", symptoms: "Fever, sore throat", waitingTime: 30, priority: "Medium" },
  { id: "P-1003", name: "Michael Brown", symptoms: "Abdominal pain, nausea", waitingTime: 20, priority: "Medium" },
  { id: "P-1004", name: "Sarah Wilson", symptoms: "Headache, dizziness", waitingTime: 15, priority: "Low" },
  { id: "P-1005", name: "David Lee", symptoms: "Allergic reaction, skin rash", waitingTime: 10, priority: "Medium" },
]

export default function PatientQueue({ searchQuery }) {
  const dispatch = useDispatch()
  const [queue, setQueue] = useState(queueData)

  // Filter queue based on search query
  const filteredQueue = queue.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.symptoms.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const assignDoctor = (patientId) => {
    toast.success(`Doctor assigned to patient ${patientId}`)
  }

  const admitToWard = (patientId) => {
    // Remove patient from queue
    setQueue(queue.filter((patient) => patient.id !== patientId))

    // Show notifications
    toast.success(`Patient ${patientId} admitted to ward`)
    dispatch(addNotification(`Patient ${patientId} has been admitted to a ward`)) // Dispatch notification
  }

  // Function to get priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">{priority}</Badge>
      case "Medium":
        return <Badge variant="default">{priority}</Badge>
      case "Low":
        return <Badge variant="outline">{priority}</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const notifications = useSelector((state) => state.notifications.notifications)

  console.log(notifications) // Check if notifications are available

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Patient Queue</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Wait Time</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQueue.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  <div>{patient.name}</div>
                  <div className="text-xs text-muted-foreground">{patient.id}</div>
                </TableCell>
                <TableCell>{patient.symptoms}</TableCell>
                <TableCell>{patient.waitingTime} min</TableCell>
                <TableCell>{getPriorityBadge(patient.priority)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => assignDoctor(patient.id)}>
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Assign
                    </Button>
                    <Button variant="default" size="sm" onClick={() => admitToWard(patient.id)}>
                      <Building className="h-3.5 w-3.5 mr-1" />
                      Admit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
