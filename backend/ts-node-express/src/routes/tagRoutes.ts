import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { generateTag } from "../controllers/tagController.js";

const router = Router();
router.post('/generateTag', verifyToken , generateTag);

export default router