import { generateToken } from "../utils/utils.js";
import Hospital from "../models/hospital.model.js";
export const deetHospital = async (req, res) => {
    const {
        name,
        region,
        bedsAvailable,
        bedsCapacity,
        staffAvailable,
        ambulances,
        ventilators,
        medicalKits,
        currentPatients,
        capacityPercent,
        lastUpdated
    } = req.body;

    try {
        if (!name || !region || bedsAvailable === undefined || bedsCapacity === undefined || 
            staffAvailable === undefined || ambulances === undefined || ventilators === undefined || 
            medicalKits === undefined || currentPatients === undefined || capacityPercent === undefined) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const newHospital = new Hospital({
            name,
            region,
            bedsAvailable,
            bedsCapacity,
            staffAvailable,
            ambulances,
            ventilators,
            medicalKits,
            currentPatients,
            capacityPercent,
            lastUpdated: lastUpdated || new Date(),
        });

        await newHospital.save();
        res.status(201).json({ message: "Hospital registered successfully", hospital: newHospital });

    } catch (error) {
        console.error("Error in hospital registration:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getHospital = async (req, res) => {
    try {
        const hospital=await Hospital.find({});
        if(hospital)
            res.status(201).json({hospitals: hospital });
    } catch (error) {
        res.status(500).json({ message: "Error fetching hospitals" });
    }
};

