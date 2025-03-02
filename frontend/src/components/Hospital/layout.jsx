"use client"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "./sidebar"
import DashboardHeader from "./header"
import StatisticsCards from "./statistics-cards"
import ChartSection from "./charts"
import PatientQueueTable from "./patient-queue"
import AlertsSection from "./alerts"

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto space-y-8">
              <StatisticsCards />
              <ChartSection />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PatientQueueTable />
                </div>
                <div>
                  <AlertsSection />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

