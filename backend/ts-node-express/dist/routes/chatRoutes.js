import { Router } from "express";
import { createNewChat, deleteChat, getAllChats, pushToChat } from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = Router();
router.post('/:chatId', verifyToken, pushToChat);
router.post('/', verifyToken, createNewChat);
router.delete('/:chatId', verifyToken, deleteChat);
router.get('/', verifyToken, getAllChats);
export default router;
