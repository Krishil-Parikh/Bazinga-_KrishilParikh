import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import AuthPage from "./components/AuthPage/AuthPage";
import ModeratorInterface from "./components/Moderator/Moderator";
import Navbar from "./components/Navbar/Navbar";
import Page from "./components/Hospital/page";
import PatientDashboard from "./components/Patient/PatientDashboard";

const App = () => {

  useEffect(()=>{
    toast.success("Here is the toast!",{
      position:'bottom-center'
    });
  },[]);

  return (
    <>
      <Toaster/>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={
            <>
              <Navbar/>
              <AuthPage/>
            </>
          } />
        <Route path="/moderator" element={ // Moderator Interface
              <ModeratorInterface/>
          } />
        <Route path="/Hdashboard" element={ // Hospital Dashboard
              <Page/>
          } />
        <Route path="/HPatient" element={ // Hospital Patients
              <PatientDashboard/>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
