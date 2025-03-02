"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Sample data for charts
const wardDistributionData = [
  { name: "ICU", patients: 24 },
  { name: "General", patients: 45 },
  { name: "Pediatric", patients: 18 },
  { name: "Orthopedic", patients: 12 },
  { name: "Cardiac", patients: 30 },
  { name: "Neurology", patients: 16 },
]

const admissionsData = [
  { date: "03/01", admissions: 12 },
  { date: "03/02", admissions: 19 },
  { date: "03/03", admissions: 15 },
  { date: "03/04", admissions: 22 },
  { date: "03/05", admissions: 18 },
  { date: "03/06", admissions: 14 },
  { date: "03/07", admissions: 24 },
]

const patientStatusData = [
  { name: "Stable", value: 65 },
  { name: "Under Observation", value: 25 },
  { name: "Critical", value: 10 },
]

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

const hospitalStayData = [
  {
    condition: "Cardiac",
    "Average Stay": 8.5,
    "Min Stay": 3,
    "Max Stay": 14,
  },
  {
    condition: "Respiratory",
    "Average Stay": 6.2,
    "Min Stay": 2,
    "Max Stay": 12,
  },
  {
    condition: "Surgical",
    "Average Stay": 5.8,
    "Min Stay": 1,
    "Max Stay": 10,
  },
  {
    condition: "Orthopedic",
    "Average Stay": 7.3,
    "Min Stay": 3,
    "Max Stay": 15,
  },
  {
    condition: "Neurological",
    "Average Stay": 9.1,
    "Min Stay": 4,
    "Max Stay": 18,
  },
]

export default function PatientCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Patient Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="distribution">Ward Distribution</TabsTrigger>
            <TabsTrigger value="admissions">Daily Admissions</TabsTrigger>
            <TabsTrigger value="status">Patient Status</TabsTrigger>
            <TabsTrigger value="stay">Hospital Stay</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={wardDistributionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="admissions" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={admissionsData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="admissions" stroke="#8b5cf6" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="status" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {patientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="stay" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hospitalStayData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="condition" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Average Stay" fill="#0ea5e9" />
                <Bar dataKey="Min Stay" fill="#a3e635" />
                <Bar dataKey="Max Stay" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

