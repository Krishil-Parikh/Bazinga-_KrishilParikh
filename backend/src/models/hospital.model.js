import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    region: { type: String, required: true },
    bedsAvailable: { type: Number, required: true, min: 0 },
    bedsCapacity: { type: Number, required: true, min: 0 },
    staffAvailable: { type: Number, required: true, min: 0 },
    ambulances: { type: Number, required: true, min: 0 },
    ventilators: { type: Number, required: true, min: 0 },
    medicalKits: { type: Number, required: true, min: 0 },
    currentPatients: { type: Number, required: true, min: 0 },
    capacityPercent: { type: Number, required: true, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
});




const Hospital = mongoose.model("hospital1", hospitalSchema);

export default Hospital;
