import Resource from "../models/resource.model.js";

// Register a new hospital
export const registerResource = async (req, res) => {
    try {
        const { ambulances, bedsCapacity, staffAvailable, ventilators, medicalKits, lastUpdated } = req.body;

        const newHospital = new Resource({
            ambulances,
            bedsCapacity,
            staffAvailable,
            ventilators,
            medicalKits,
            lastUpdated: new Date(lastUpdated)
        });

        await newHospital.save();
        res.status(201).json({ message: "Resource added successfully", hospital: newHospital });
    } catch (error) {
        res.status(500).json({ message: "Error registering hospital", error: error.message });
    }
};

export const getResource = async (req, res) => {
    try {
        const resource=await Resource.find({});
        if(resource)
            res.status(201).json({ resources: resource });
    } catch (error) {
        res.status(500).json({ message: "Error fetching resource" });
    }
};
