import { Router } from 'express'
import { uploadDocument } from '../controllers/documentController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();
router.post('/createDocument', verifyToken ,uploadDocument)

export default router