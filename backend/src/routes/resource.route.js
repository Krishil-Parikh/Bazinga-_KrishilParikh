import express from "express";
import {
    registerResource,
    getResource
} from "../controllers/resource.controller.js";
import { verifyToken } from "../utils/utils.js";


const router = express.Router();

router.post("/register", verifyToken, registerResource);
router.get("/fetch", verifyToken, getResource);
export default router;
