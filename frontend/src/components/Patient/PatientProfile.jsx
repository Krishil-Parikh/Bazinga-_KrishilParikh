"use client"

import React, { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Calendar,
  Activity,
  FileText,
  Pill,
  Users,
  Upload,
  Heart,
  Droplets,
  Thermometer,
  TreesIcon as Lungs,
} from "lucide-react"

// Sample patient data for the profile
const patientDetails = {
  fullName: "Robert Johnson",
  age: 58,
  gender: "Male",
  bloodType: "O+",
  height: "5'10\"",
  weight: "180 lbs",
  allergies: ["Penicillin", "Shellfish"],
  medicalHistory: [
    { condition: "Hypertension", diagnosedYear: 2015 },
    { condition: "Type 2 Diabetes", diagnosedYear: 2018 },
  ],
  vitals: {
    bloodPressure: "140/90",
    heartRate: 85,
    oxygenLevel: 96,
    temperature: 98.6,
    respiratoryRate: 18,
  },
  labResults: [
    {
      test: "Complete Blood Count",
      date: "2023-03-01",
      result: "Normal",
      details: "WBC: 7.5, RBC: 4.8, Hgb: 14.2, Hct: 42%",
    },
    {
      test: "Comprehensive Metabolic Panel",
      date: "2023-03-01",
      result: "Abnormal",
      details: "Glucose: 142 mg/dL (High), BUN: 18, Creatinine: 1.0",
    },
    {
      test: "Cardiac Enzymes",
      date: "2023-03-01",
      result: "Abnormal",
      details: "Troponin I: 0.8 ng/mL (Elevated), CK-MB: 12 ng/mL",
    },
  ],
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", purpose: "Blood pressure" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", purpose: "Diabetes" },
    { name: "Aspirin", dosage: "81mg", frequency: "Once daily", purpose: "Blood thinner" },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime", purpose: "Cholesterol" },
  ],
  treatmentPlan:
    "Patient admitted for acute myocardial infarction. Treatment includes antiplatelet therapy, anticoagulation, and monitoring for complications. Will require cardiac catheterization to assess coronary artery blockage. Post-procedure, patient will need cardiac rehabilitation and medication adjustment.",
  careTeam: [
    { name: "Dr. Sarah Williams", role: "Cardiologist", contact: "555-123-4567" },
    { name: "Dr. James Peterson", role: "Internal Medicine", contact: "555-234-5678" },
    { name: "Nurse Rebecca Johnson", role: "Primary Care Nurse", contact: "555-345-6789" },
  ],
}

export default function PatientProfile({ patient, isOpen, setIsOpen, onUpdateStatus }) {
  const [currentVitals, setCurrentVitals] = useState(patientDetails.vitals)

  // Function to simulate real-time vitals update
  const updateVitals = useCallback(() => {
    setCurrentVitals({
      bloodPressure: `${Math.floor(Math.random() * 20) + 130}/${Math.floor(Math.random() * 10) + 85}`,
      heartRate: Math.floor(Math.random() * 15) + 75,
      oxygenLevel: Math.floor(Math.random() * 5) + 94,
      temperature: (Math.random() * 1 + 98).toFixed(1),
      respiratoryRate: Math.floor(Math.random() * 5) + 16,
    })
  }, [])

  // Update vitals every 5 seconds to simulate real-time monitoring
  React.useEffect(() => {
    if (isOpen) {
      const interval = setInterval(updateVitals, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen, updateVitals])

  // Function to get heart rate status
  const getHeartRateStatus = (rate) => {
    if (rate > 100) return "high"
    if (rate < 60) return "low"
    return "normal"
  }

  // Function to get oxygen level status
  const getOxygenStatus = (level) => {
    if (level < 90) return "critical"
    if (level < 95) return "warning"
    return "normal"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Patient Profile
          </DialogTitle>
          <DialogDescription>
            Complete medical information for {patient.name} ({patient.id})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="tests">Lab Tests</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="care-team">Care Team</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Full Name:</div>
                      <div>{patientDetails.fullName}</div>

                      <div className="text-sm font-medium">Age:</div>
                      <div>{patientDetails.age} years</div>

                      <div className="text-sm font-medium">Gender:</div>
                      <div>{patientDetails.gender}</div>

                      <div className="text-sm font-medium">Blood Type:</div>
                      <div>{patientDetails.bloodType}</div>

                      <div className="text-sm font-medium">Height:</div>
                      <div>{patientDetails.height}</div>

                      <div className="text-sm font-medium">Weight:</div>
                      <div>{patientDetails.weight}</div>
                    </div>

                    <div className="pt-2">
                      <div className="text-sm font-medium mb-1">Allergies:</div>
                      <div className="flex flex-wrap gap-1">
                        {patientDetails.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Admission Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Patient ID:</div>
                      <div>{patient.id}</div>

                      <div className="text-sm font-medium">Ward:</div>
                      <div>{patient.ward}</div>

                      <div className="text-sm font-medium">Admission Date:</div>
                      <div>{new Date(patient.admissionDate).toLocaleDateString()}</div>

                      <div className="text-sm font-medium">Est. Discharge:</div>
                      <div>{new Date(patient.estimatedDischarge).toLocaleDateString()}</div>

                      <div className="text-sm font-medium">Primary Doctor:</div>
                      <div>{patient.doctor}</div>

                      <div className="text-sm font-medium">Status:</div>
                      <div>
                        <Badge
                          variant={
                            patient.status === "Critical"
                              ? "destructive"
                              : patient.status === "Stable"
                                ? "success"
                                : "warning"
                          }
                          className={
                            patient.status === "Stable"
                              ? "bg-green-500"
                              : patient.status === "Under Observation"
                                ? "bg-yellow-500"
                                : ""
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Medical History & Current Condition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Medical History:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {patientDetails.medicalHistory.map((item, index) => (
                        <li key={index}>
                          {item.condition} (Diagnosed: {item.diagnosedYear})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Diagnosis:</h4>
                    <p>{patient.diagnosis}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Treatment Plan:</h4>
                    <p className="text-sm">{patientDetails.treatmentPlan}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Real-time Vital Signs
                  </CardTitle>
                  <CardDescription>Updated every 5 seconds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Heart Rate</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            getHeartRateStatus(currentVitals.heartRate) === "high"
                              ? "text-red-500"
                              : getHeartRateStatus(currentVitals.heartRate) === "low"
                                ? "text-blue-500"
                                : "text-green-500"
                          }`}
                        >
                          {currentVitals.heartRate} BPM
                        </span>
                      </div>
                      <Progress
                        value={(currentVitals.heartRate / 150) * 100}
                        className={`h-2 ${
                          getHeartRateStatus(currentVitals.heartRate) === "high"
                            ? "bg-red-200"
                            : getHeartRateStatus(currentVitals.heartRate) === "low"
                              ? "bg-blue-200"
                              : "bg-green-200"
                        }`}
                        indicatorClassName={`${
                          getHeartRateStatus(currentVitals.heartRate) === "high"
                            ? "bg-red-500"
                            : getHeartRateStatus(currentVitals.heartRate) === "low"
                              ? "bg-blue-500"
                              : "bg-green-500"
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Blood Pressure</span>
                        </div>
                        <span className="text-sm font-bold">{currentVitals.bloodPressure} mmHg</span>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Number.parseInt(currentVitals.bloodPressure.split("/")[0]) / 2}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Lungs className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-medium">Oxygen Level</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            getOxygenStatus(currentVitals.oxygenLevel) === "critical"
                              ? "text-red-500"
                              : getOxygenStatus(currentVitals.oxygenLevel) === "warning"
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        >
                          {currentVitals.oxygenLevel}%
                        </span>
                      </div>
                      <Progress
                        value={currentVitals.oxygenLevel}
                        className={`h-2 ${
                          getOxygenStatus(currentVitals.oxygenLevel) === "critical"
                            ? "bg-red-200"
                            : getOxygenStatus(currentVitals.oxygenLevel) === "warning"
                              ? "bg-yellow-200"
                              : "bg-green-200"
                        }`}
                        indicatorClassName={`${
                          getOxygenStatus(currentVitals.oxygenLevel) === "critical"
                            ? "bg-red-500"
                            : getOxygenStatus(currentVitals.oxygenLevel) === "warning"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Temperature</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            Number.parseFloat(currentVitals.temperature) > 99.5
                              ? "text-red-500"
                              : Number.parseFloat(currentVitals.temperature) < 97.0
                                ? "text-blue-500"
                                : "text-green-500"
                          }`}
                        >
                          {currentVitals.temperature}°F
                        </span>
                      </div>
                      <Progress
                        value={((Number.parseFloat(currentVitals.temperature) - 95) / 10) * 100}
                        className="h-2 bg-orange-100"
                        indicatorClassName="bg-orange-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Tests Tab */}
            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Laboratory Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patientDetails.labResults.map((test, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{test.test}</h4>
                          <Badge variant={test.result === "Normal" ? "outline" : "destructive"}>{test.result}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Date: {new Date(test.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm">{test.details}</div>
                      </div>
                    ))}

                    <div className="flex justify-center mt-4">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload New Test Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patientDetails.medications.map((med, index) => (
                      <div key={index} className="flex items-start p-3 border rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{med.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            {med.dosage} - {med.frequency}
                          </div>
                          <div className="text-xs mt-1">Purpose: {med.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Care Team Tab */}
            <TabsContent value="care-team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Healthcare Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patientDetails.careTeam.map((member, index) => (
                      <div key={index} className="flex items-start p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                          <div className="text-xs mt-1">Contact: {member.contact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge
              variant={
                patient.status === "Critical" ? "destructive" : patient.status === "Stable" ? "success" : "warning"
              }
              className={
                patient.status === "Stable"
                  ? "bg-green-500"
                  : patient.status === "Under Observation"
                    ? "bg-yellow-500"
                    : ""
              }
            >
              {patient.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onUpdateStatus(patient.id, "Critical")
                setIsOpen(false)
              }}
            >
              Mark as Critical
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onUpdateStatus(patient.id, "Stable")
                setIsOpen(false)
              }}
            >
              Mark as Stable
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

