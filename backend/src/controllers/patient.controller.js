import { generateToken } from "../utils/utils.js";
import Patient from "../models/patient.model.js";


export const patientRegister = async (req, res) => {
    const {
      age,
      gender,
      heartRate,
      systolicBP,
      diastolicBP,
      oxygenSaturation,
      respiratoryRate,
      bodyTemperature,
      pupilDilation,
      pupilReactivity,
      eyeMovement,
      consciousnessLevel,
      glasgowComaScale,
      speechCoherence,
      bloodSugarLevel,
      skinCondition,
      painLevel,
      knownAllergies,
      medicationHistory,
      symptoms,
      initialDiagnosis,
      triagePriority,
      reggedBy,
      arrivalMode,
      timeOfArrival,
    } = req.body;
  
    try {
      // Check for required fields
      if (
        !age ||
        !gender ||
        !heartRate ||
        !systolicBP ||
        !diastolicBP ||
        !oxygenSaturation ||
        !respiratoryRate ||
        !bodyTemperature ||
        !pupilDilation ||
        !pupilReactivity ||
        !eyeMovement ||
        !consciousnessLevel ||
        !glasgowComaScale ||
        !speechCoherence ||
        !bloodSugarLevel ||
        !skinCondition ||
        !painLevel ||
        !symptoms ||
        !initialDiagnosis ||
        // !triagePriority ||
        // !reggedBy ||
        !arrivalMode
      ) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
  
      const newPatient = new Patient({
        age,
        gender,
        heartRate,
        systolicBP,
        diastolicBP,
        oxygenSaturation,
        respiratoryRate,
        bodyTemperature,
        pupilDilation,
        pupilReactivity,
        eyeMovement,
        consciousnessLevel,
        glasgowComaScale,
        speechCoherence,
        bloodSugarLevel,
        skinCondition,
        painLevel: painLevel || [5], // Defaulting if not provided
        knownAllergies: knownAllergies || "",
        medicationHistory: medicationHistory || "",
        symptoms,
        initialDiagnosis,
        triagePriority,
        reggedBy,
        arrivalMode,
        timeOfArrival: timeOfArrival || new Date(),
      });
  
      await newPatient.save();
  
      res.status(201).json({
        message: "Patient record successfully created",
        patient: newPatient,
      });
    } catch (error) {
      console.log("Error in patient signup:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

  export const getPatient = async (req, res) => {
    try {
        const patient=await Patient.find({});
        if(patient)
            res.status(201).json({ patients: patient });
    } catch (error) {
        res.status(500).json({ message: "Error fetching patients" });
    }
};