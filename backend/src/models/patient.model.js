import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  // Personal Information
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

  // Vital Signs
  heartRate: { type: Number, required: true },
  systolicBP: { type: Number, required: true },
  diastolicBP: { type: Number, required: true },
  oxygenSaturation: { type: Number, required: true },
  respiratoryRate: { type: Number, required: true },
  bodyTemperature: { type: Number, required: true },

  // Neurological & Physical Assessment
  pupilDilation: { type: String, required: true },
  pupilReactivity: { type: String, required: true },
  eyeMovement: { type: String, required: true },
  consciousnessLevel: { type: String, required: true },
  glasgowComaScale: { type: Number, required: true },
  speechCoherence: { type: String, required: true },

  // Additional Medical Information
  bloodSugarLevel: { type: Number, required: true },
  skinCondition: { type: String, required: true },
  painLevel: { type: [Number], default: [5], required: true },
  knownAllergies: { type: String, default: "" },
  medicationHistory: { type: String, default: "" },

  // Symptoms & Initial Assessment
  symptoms: { type: String, required: true },
  initialDiagnosis: { type: String, required: true },
  triagePriority: { type: String, required: true },
  reggedBy: {
    type: String,
    enum: ["hospital", "camp"], // Role options
    default: "camp", // Default role
  },

  assign_severity: {
    type: String,
    enum: ["Critical", "Urgent", "Stable"], // Role options
    default: "Stable", // Default role
  },
  // Arrival Information
  arrivalMode: { type: String, required: true },
  timeOfArrival: { type: Date, required: true, default: Date.now },
});

patientSchema.pre("save", function (next) {
  if (this.glasgowComaScale < 8 || this.oxygenSaturation < 90) {
    this.assign_severity = "Critical";
  } else if (this.systolicBP < 90 || this.painLevel.some((p) => p > 7)) {
    this.assign_severity = "Urgent";
  } else {
    this.assign_severity = "Stable";
  }

  next();
});


const Patient = mongoose.model("patient", patientSchema);

export default Patient;
