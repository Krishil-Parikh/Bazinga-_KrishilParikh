"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, UserCog, LogOut } from "lucide-react"

export default function PatientQueueTable() {
  const [patients] = useState([
    {
      id: "P001",
      name: "John Doe",
      waitingTime: "2h 15m",
      doctor: "Dr. Smith",
      ward: "Emergency",
      status: "Waiting",
    },
    {
      id: "P002",
      name: "Jane Smith",
      waitingTime: "1h 30m",
      doctor: "Dr. Johnson",
      ward: "ICU",
      status: "Critical",
    },
    {
      id: "P003",
      name: "Bob Wilson",
      waitingTime: "45m",
      doctor: "Dr. Brown",
      ward: "General",
      status: "In Treatment",
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "Waiting":
        return "text-yellow-500"
      case "Critical":
        return "text-red-500"
      case "In Treatment":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Queue & Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Waiting Time</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.waitingTime}</TableCell>
                <TableCell>{patient.doctor}</TableCell>
                <TableCell>{patient.ward}</TableCell>
                <TableCell className={getStatusColor(patient.status)}>{patient.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <LogOut className="h-4 w-4" />
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

