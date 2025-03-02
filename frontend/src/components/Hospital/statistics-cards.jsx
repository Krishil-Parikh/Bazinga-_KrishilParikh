"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Users, Ambulance, Syringe, UserRound } from "lucide-react"

export default function StatisticsCards() {
  const stats = [
    {
      title: "Available Beds",
      value: "45/100",
      change: "+2",
      icon: Bed,
    },
    {
      title: "On-Duty Staff",
      value: "120",
      change: "-5",
      icon: Users,
    },
    {
      title: "Ambulances",
      value: "8/10",
      change: "0",
      icon: Ambulance,
    },
    {
      title: "Vaccine Stock",
      value: "2,500",
      change: "-100",
      icon: Syringe,
    },
    {
      title: "Total Patients",
      value: "284",
      change: "+12",
      icon: UserRound,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${stat.change.startsWith("+") ? "text-green-500" : stat.change.startsWith("-") ? "text-red-500" : "text-muted-foreground"}`}
            >
              {stat.change} from last hour
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

