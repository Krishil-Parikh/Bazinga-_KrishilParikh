import express from "express";
import { patientRegister,
    getPatient
  
} from "../controllers/patient.controller.js";
import { verifyToken } from "../utils/utils.js";

const router = express.Router();

// router.post("/register", verifyToken, patientRegister);
router.post("/register", patientRegister);
router.get("/fetch", verifyToken, getPatient);


export default router;
