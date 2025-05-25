import { Router } from "express";
import { createNewChat, deleteChat, pushToChat } from "../controllers/chatController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();
router.post('/chat/:chatId', verifyToken, pushToChat);
router.post('/chat', verifyToken, createNewChat)
router.delete('/chat/:chatId', verifyToken, deleteChat);

export default router