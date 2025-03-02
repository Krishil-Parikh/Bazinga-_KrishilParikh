import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    ambulances: { type: Number, required: true, min: 0 },
    bedsCapacity: { type: Number, required: true, min: 0 },
    staffAvailable: { type: Number, required: true, min: 0 },
    ventilators: { type: Number, required: true, min: 0 },
    medicalKits: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, required: true }
});

const Resource = mongoose.model("Hospital1", resourceSchema);

export default Resource;
