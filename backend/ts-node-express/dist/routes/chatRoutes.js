import { Router } from "express";
import { createNewChat, deleteChat, pushToChat } from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = Router();
router.post('/chat/:chatId', verifyToken, pushToChat);
router.post('/chat', verifyToken, createNewChat);
router.delete('/chat/:chatId', verifyToken, deleteChat);
export default router;
