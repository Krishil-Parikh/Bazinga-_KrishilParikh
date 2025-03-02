"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Clock } from "lucide-react"

export default function AlertsSection() {
  const alerts = [
    {
      type: "emergency",
      title: "Critical Patient Alert",
      description: "ICU Patient #P002 needs immediate attention",
      icon: AlertCircle,
    },
    {
      type: "warning",
      title: "Low Medical Stock",
      description: "Insulin supplies below threshold (15%)",
      icon: AlertTriangle,
    },
    {
      type: "info",
      title: "Upcoming Shift Change",
      description: "Night shift starts in 30 minutes",
      icon: Clock,
    },
  ]

  const getAlertStyles = (type) => {
    switch (type) {
      case "emergency":
        return "border-red-500 text-red-500"
      case "warning":
        return "border-yellow-500 text-yellow-500"
      case "info":
        return "border-blue-500 text-blue-500"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critical Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <Alert key={index} className={getAlertStyles(alert.type)}>
            <alert.icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}

