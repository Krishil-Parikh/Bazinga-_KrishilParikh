import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileIcon as FilePdf, BarChart } from "lucide-react"

export default function ExportReports({ dateRange }) {
  const handleExportCSV = () => {
    // In a real application, this would generate and download a CSV file
    alert(
      "Exporting CSV report for date range: " +
        dateRange.from.toLocaleDateString() +
        " to " +
        dateRange.to.toLocaleDateString(),
    )
  }

  const handleExportPDF = () => {
    // In a real application, this would generate and download a PDF file
    alert(
      "Exporting PDF report for date range: " +
        dateRange.from.toLocaleDateString() +
        " to " +
        dateRange.to.toLocaleDateString(),
    )
  }

  const handleViewTrends = () => {
    // In a real application, this would open a detailed trends view
    alert(
      "Opening historical trends for date range: " +
        dateRange.from.toLocaleDateString() +
        " to " +
        dateRange.to.toLocaleDateString(),
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Reports & Data Export</CardTitle>
        <Download className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="text-sm text-muted-foreground">
            Export patient data for date range:{" "}
            <span className="font-medium">{dateRange.from.toLocaleDateString()}</span> to{" "}
            <span className="font-medium">{dateRange.to.toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
              <FilePdf className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="default" className="flex items-center gap-2" onClick={handleViewTrends}>
              <BarChart className="h-4 w-4" />
              View Trends
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

