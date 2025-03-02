import express from "express";
import {
  deetHospital,
  getHospital
} from "../controllers/hospital.controller.js";
import { verifyToken } from "../utils/utils.js";


const router = express.Router();

router.post("/deet", verifyToken, deetHospital);
router.get("/fetch", verifyToken, getHospital);
export default router;
