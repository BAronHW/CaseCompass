import { Router } from "express";
import { findAllUsers, findUserByUid } from "../controllers/userController.js";

const router = Router();
router.get('/user/:uid', findUserByUid);
router.get('/user/', findAllUsers);

export default router;