"use client"

import { useState } from "react"
import { Clock, Home, LineChart, Menu, Search, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "react-hot-toast"

import PatientStats from "./PatientStats"
import PatientQueue from "./PatientQueue"
import AdmittedPatients from "./AdmittedPatients"
import PatientCharts from "./PatientCharts"
import PatientNotifications from "./PatientNotifications"
import ExportReports from "./ExportReports"

export default function PatientDashboard() {
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">MediCare</h2>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Main Menu</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Patients
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Resources
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Staff Management
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <LineChart className="mr-2 h-4 w-4" />
                Reports & Analytics
              </Button>
            </div>
          </div>
        </nav>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-3 left-3 z-10">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">MediCare</h2>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Main Menu</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Patients
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Resources
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Staff Management
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <LineChart className="mr-2 h-4 w-4" />
                  Reports & Analytics
                </Button>
              </div>
            </div>
          </nav>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">Patient Management</h1>
          </div>
          <div className="flex-1 md:flex-none md:w-80">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DatePickerWithRange date={date} setDate={setDate} />
            <PatientNotifications />
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-6">
            <PatientStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatientQueue searchQuery={searchQuery} />
              <PatientCharts />
            </div>

            <AdmittedPatients searchQuery={searchQuery} />

            <ExportReports dateRange={date} />
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <Toaster position="top-right" />
    </div>
  )
}

