"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ChartSection() {
  // Sample data for charts
  const bedData = [
    { department: "ICU", total: 50, occupied: 45 },
    { department: "Emergency", total: 30, occupied: 20 },
    { department: "Pediatric", total: 40, occupied: 25 },
    { department: "General", total: 100, occupied: 70 },
  ]

  const staffData = [
    { name: "Doctors", value: 50 },
    { name: "Nurses", value: 120 },
    { name: "Emergency", value: 30 },
    { name: "Admin", value: 20 },
  ]

  const ambulanceData = [
    { time: "00:00", active: 4, idle: 6 },
    { time: "04:00", active: 6, idle: 4 },
    { time: "08:00", active: 8, idle: 2 },
    { time: "12:00", active: 7, idle: 3 },
    { time: "16:00", active: 5, idle: 5 },
    { time: "20:00", active: 3, idle: 7 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Bed Occupancy by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#93c5fd" name="Total Beds" />
              <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#3b82f6"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Ambulance Activity (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ambulanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="active" stroke="#3b82f6" name="Active" />
              <Line type="monotone" dataKey="idle" stroke="#93c5fd" name="Idle" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

