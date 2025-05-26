import { Router } from 'express'
import { uploadDocument } from '../controllers/documentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.post('/createDocument', verifyToken ,uploadDocument)

export default router