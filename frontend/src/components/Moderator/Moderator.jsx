"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Search, Bell, ChevronDown, Home, Users, Activity, Boxes, Settings, Save, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { useToast } from "@/components/ui/use-toast"
import toast, { Toaster } from "react-hot-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarInterface from "../Sidebar/Sidebar"

export default function ModeratorInterface() {
  const [date, setDate] = useState(new Date())

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    age: "",
    gender: "",

    // Vital Signs
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    bodyTemperature: "",

    // Neurological & Physical Assessment
    pupilDilation: "",
    pupilReactivity: "",
    eyeMovement: "",
    consciousnessLevel: "",
    glasgowComaScale: "",
    speechCoherence: "",

    // Additional Medical Information
    bloodSugarLevel: "",
    skinCondition: "",
    painLevel: [5],
    knownAllergies: "",
    medicationHistory: "",

    // Symptoms & Initial Assessment
    symptoms: "",
    initialDiagnosis: "",
    triagePriority: "",

    // Arrival Information
    arrivalMode: "",
    timeOfArrival: date,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value) => {
    setFormData((prev) => ({ ...prev, painLevel: value }))
  }

  const handleDateChange = (date) => {
    setDate(date)
    setFormData((prev) => ({ ...prev, timeOfArrival: date }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)

    // Check if required fields are filled
    const requiredFields = ["age", "gender", "heartRate", "systolicBP", "diastolicBP", "triagePriority"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Error: Please check the missing fields",
        description: `Missing: ${missingFields.join(", ")}`,
      })
    } else {
      toast({
        title: "Patient record successfully saved!",
        description: "The patient has been added to the system.",
      })

      // Reset form after successful submission
      // setFormData({...}) - Uncomment to reset form
    }
  }

  const handleCancel = () => {
    // Reset form
    console.log("Form reset")
    // Implement form reset logic here
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <SidebarInterface/>

        {/* Main Content */}
        <div className="flex flex-col flex-1 justify-center w-">
          {/* Header */}
          <header className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1 flex items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search patients..." className="w-full pl-8" />
                </div>
              </div>

              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Dr. Smith</p>
                  <p className="text-xs text-muted-foreground">Emergency Dept.</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-5xl">
              <form onSubmit={handleSubmit}>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>New Patient Entry</CardTitle>
                    <CardDescription>
                      Enter patient details for real-time triage and resource allocation.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="vitals">Vitals</TabsTrigger>
                        <TabsTrigger value="neuro">Neurological</TabsTrigger>
                        <TabsTrigger value="medical">Medical Info</TabsTrigger>
                        <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                        <TabsTrigger value="arrival">Arrival</TabsTrigger>
                      </TabsList>

                      {/* Personal Information */}
                      <TabsContent value="personal" className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="age" className="text-sm font-medium">
                              Age
                            </label>
                            <Input
                              id="age"
                              name="age"
                              type="number"
                              placeholder="Enter age"
                              value={formData.age}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="gender" className="text-sm font-medium">
                              Gender
                            </label>
                            <Select
                              value={formData.gender}
                              onValueChange={(value) => handleSelectChange("gender", value)}
                            >
                              <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Vital Signs */}
                      <TabsContent value="vitals" className="space-y-4">
                        <h3 className="text-lg font-medium">Vital Signs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="heartRate" className="text-sm font-medium">
                              Heart Rate (bpm)
                            </label>
                            <Input
                              id="heartRate"
                              name="heartRate"
                              type="number"
                              placeholder="Enter heart rate"
                              value={formData.heartRate}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="systolicBP" className="text-sm font-medium">
                              Systolic BP (mmHg)
                            </label>
                            <Input
                              id="systolicBP"
                              name="systolicBP"
                              type="number"
                              placeholder="Enter systolic BP"
                              value={formData.systolicBP}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="diastolicBP" className="text-sm font-medium">
                              Diastolic BP (mmHg)
                            </label>
                            <Input
                              id="diastolicBP"
                              name="diastolicBP"
                              type="number"
                              placeholder="Enter diastolic BP"
                              value={formData.diastolicBP}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="oxygenSaturation" className="text-sm font-medium">
                              Oxygen Saturation (%)
                            </label>
                            <Input
                              id="oxygenSaturation"
                              name="oxygenSaturation"
                              type="number"
                              placeholder="Enter oxygen saturation"
                              value={formData.oxygenSaturation}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="respiratoryRate" className="text-sm font-medium">
                              Respiratory Rate (breaths/min)
                            </label>
                            <Input
                              id="respiratoryRate"
                              name="respiratoryRate"
                              type="number"
                              placeholder="Enter respiratory rate"
                              value={formData.respiratoryRate}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="bodyTemperature" className="text-sm font-medium">
                              Body Temperature (°C)
                            </label>
                            <Input
                              id="bodyTemperature"
                              name="bodyTemperature"
                              type="number"
                              step="0.1"
                              placeholder="Enter body temperature"
                              value={formData.bodyTemperature}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Neurological & Physical Assessment */}
                      <TabsContent value="neuro" className="space-y-4">
                        <h3 className="text-lg font-medium">Neurological & Physical Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="pupilDilation" className="text-sm font-medium">
                              Pupil Dilation
                            </label>
                            <Select
                              value={formData.pupilDilation}
                              onValueChange={(value) => handleSelectChange("pupilDilation", value)}
                            >
                              <SelectTrigger id="pupilDilation">
                                <SelectValue placeholder="Select pupil dilation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="constricted">Constricted</SelectItem>
                                <SelectItem value="dilated">Dilated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="pupilReactivity" className="text-sm font-medium">
                              Pupil Reactivity
                            </label>
                            <Select
                              value={formData.pupilReactivity}
                              onValueChange={(value) => handleSelectChange("pupilReactivity", value)}
                            >
                              <SelectTrigger id="pupilReactivity">
                                <SelectValue placeholder="Select pupil reactivity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reactive">Reactive</SelectItem>
                                <SelectItem value="non-reactive">Non-reactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="eyeMovement" className="text-sm font-medium">
                              Eye Movement
                            </label>
                            <Select
                              value={formData.eyeMovement}
                              onValueChange={(value) => handleSelectChange("eyeMovement", value)}
                            >
                              <SelectTrigger id="eyeMovement">
                                <SelectValue placeholder="Select eye movement" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="restricted">Restricted</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="consciousnessLevel" className="text-sm font-medium">
                              Consciousness Level
                            </label>
                            <Select
                              value={formData.consciousnessLevel}
                              onValueChange={(value) => handleSelectChange("consciousnessLevel", value)}
                            >
                              <SelectTrigger id="consciousnessLevel">
                                <SelectValue placeholder="Select consciousness level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="alert">Alert</SelectItem>
                                <SelectItem value="drowsy">Drowsy</SelectItem>
                                <SelectItem value="unresponsive">Unresponsive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="glasgowComaScale" className="text-sm font-medium">
                              Glasgow Coma Scale (3-15)
                            </label>
                            <Input
                              id="glasgowComaScale"
                              name="glasgowComaScale"
                              type="number"
                              min="3"
                              max="15"
                              placeholder="Enter GCS score"
                              value={formData.glasgowComaScale}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="speechCoherence" className="text-sm font-medium">
                              Speech Coherence
                            </label>
                            <Select
                              value={formData.speechCoherence}
                              onValueChange={(value) => handleSelectChange("speechCoherence", value)}
                            >
                              <SelectTrigger id="speechCoherence">
                                <SelectValue placeholder="Select speech coherence" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="clear">Clear</SelectItem>
                                <SelectItem value="slurred">Slurred</SelectItem>
                                <SelectItem value="incoherent">Incoherent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Additional Medical Information */}
                      <TabsContent value="medical" className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Medical Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="bloodSugarLevel" className="text-sm font-medium">
                              Blood Sugar Level (mg/dL)
                            </label>
                            <Input
                              id="bloodSugarLevel"
                              name="bloodSugarLevel"
                              type="number"
                              placeholder="Enter blood sugar level"
                              value={formData.bloodSugarLevel}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="skinCondition" className="text-sm font-medium">
                              Skin Condition
                            </label>
                            <Select
                              value={formData.skinCondition}
                              onValueChange={(value) => handleSelectChange("skinCondition", value)}
                            >
                              <SelectTrigger id="skinCondition">
                                <SelectValue placeholder="Select skin condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="pale">Pale</SelectItem>
                                <SelectItem value="cyanotic">Cyanotic</SelectItem>
                                <SelectItem value="jaundiced">Jaundiced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <label htmlFor="painLevel" className="text-sm font-medium">
                              Pain Level (0-10): {formData.painLevel}
                            </label>
                            <Slider
                              id="painLevel"
                              min={0}
                              max={10}
                              step={1}
                              value={formData.painLevel}
                              onValueChange={handleSliderChange}
                              className="py-4"
                            />
                          </div>

                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <label htmlFor="knownAllergies" className="text-sm font-medium">
                              Known Allergies
                            </label>
                            <Textarea
                              id="knownAllergies"
                              name="knownAllergies"
                              placeholder="Enter known allergies"
                              value={formData.knownAllergies}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <label htmlFor="medicationHistory" className="text-sm font-medium">
                              Medication History
                            </label>
                            <Textarea
                              id="medicationHistory"
                              name="medicationHistory"
                              placeholder="Enter medication history"
                              value={formData.medicationHistory}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Symptoms & Initial Assessment */}
                      <TabsContent value="symptoms" className="space-y-4">
                        <h3 className="text-lg font-medium">Symptoms & Initial Assessment</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="symptoms" className="text-sm font-medium">
                              Symptoms
                            </label>
                            <Textarea
                              id="symptoms"
                              name="symptoms"
                              placeholder="Enter symptoms"
                              value={formData.symptoms}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="initialDiagnosis" className="text-sm font-medium">
                              Initial Diagnosis
                            </label>
                            <Input
                              id="initialDiagnosis"
                              name="initialDiagnosis"
                              placeholder="Enter initial diagnosis"
                              value={formData.initialDiagnosis}
                              onChange={handleInputChange}
                            />
                          </div>

                        </div>
                      </TabsContent>

                      {/* Arrival Information */}
                      <TabsContent value="arrival" className="space-y-4">
                        <h3 className="text-lg font-medium">Arrival Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="arrivalMode" className="text-sm font-medium">
                              Arrival Mode
                            </label>
                            <Select
                              value={formData.arrivalMode}
                              onValueChange={(value) => handleSelectChange("arrivalMode", value)}
                            >
                              <SelectTrigger id="arrivalMode">
                                <SelectValue placeholder="Select arrival mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ambulance">Ambulance</SelectItem>
                                <SelectItem value="walk-in">Walk-in</SelectItem>
                                <SelectItem value="airlift">Airlift</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="timeOfArrival" className="text-sm font-medium">
                              Time of Arrival
                            </label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button variant="secondary" type="button" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Submit Patient Data
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

