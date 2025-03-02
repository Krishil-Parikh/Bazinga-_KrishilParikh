"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Building, Eye, RefreshCw, LogOut } from "lucide-react";
import PatientProfile from "./PatientProfile";
import { usePatientNotifications } from "./PatientNotifications";

// Sample data for admitted patients
const admittedPatientsData = [
  {
    id: "P-5001",
    name: "Robert Johnson",
    doctor: "Dr. Sarah Williams",
    ward: "ICU",
    admissionDate: "2023-03-01",
    estimatedDischarge: "2023-03-07",
    diagnosis: "Myocardial Infarction",
    status: "Critical",
  },
  {
    id: "P-5002",
    name: "Jennifer Davis",
    doctor: "Dr. Michael Chen",
    ward: "General",
    admissionDate: "2023-03-02",
    estimatedDischarge: "2023-03-05",
    diagnosis: "Pneumonia",
    status: "Stable",
  },
];

export default function AdmittedPatients({ searchQuery }) {
  const [patients, setPatients] = useState(admittedPatientsData);
  const [sortField, setSortField] = useState("admissionDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { notifyEmergency, notifyDischarge } = usePatientNotifications();

  // Filter patients based on search query
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    return sortOrder === "asc" ? a[sortField] > b[sortField] ? 1 : -1 : a[sortField] < b[sortField] ? 1 : -1;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;
  const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);
  const currentPatients = sortedPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage);

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setIsProfileOpen(true);
  };

  const handleUpdateStatus = (patientId, newStatus) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id === patientId) {
          if (newStatus === "Critical" && patient.status !== "Critical") {
            notifyEmergency(`Patient ${patient.name} condition changed to Critical!`);
          }
          return { ...patient, status: newStatus };
        }
        return patient;
      })
    );
  };

  const handleDischarge = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      notifyDischarge(`Patient ${patient.name} has been discharged`);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Admitted Patients</CardTitle>
          <Select defaultValue={sortField} onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admissionDate">Admission Date</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="ward">Ward</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.doctor}</TableCell>
                  <TableCell>{patient.ward}</TableCell>
                  <TableCell>{patient.admissionDate}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>{patient.status}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(patient)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleDischarge(patient.id)}>
                        <LogOut className="h-3.5 w-3.5 mr-1" />
                        Discharge
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {selectedPatient && <PatientProfile patient={selectedPatient} isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />}
    </>
  );
}
