import { Router } from "express";
import { findUserByUid } from "../controllers/userController";

const router = Router();
router.get('/user/:uuid', findUserByUid)

export default router;