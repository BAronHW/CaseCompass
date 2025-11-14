import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { attachTagToDoc, deleteTag, deleteTagFromDoc, editTag, generateTag, getAllTag, getTag } from "../controllers/tagController.js";

const router = Router();
router.post('/generateTag', verifyToken , generateTag);
router.get('/:tagId', verifyToken, getTag)
router.get('/getAllTag', verifyToken, getAllTag);
router.post('/attachTagToDoc', verifyToken, attachTagToDoc);
router.post('/deleteTagFromDoc', verifyToken, deleteTagFromDoc);
router.delete('/deleteTag', verifyToken, deleteTag);
router.put('/editTag', verifyToken, editTag);

export default router