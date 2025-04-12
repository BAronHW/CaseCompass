import { Router } from "express";
import { findAllUsers, findUserByUid } from "../controllers/userController";

const router = Router();
router.get('/user/:uuid', findUserByUid);
router.get('/user/', findAllUsers);

export default router;