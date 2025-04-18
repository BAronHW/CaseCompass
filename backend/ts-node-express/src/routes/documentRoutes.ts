import { Router } from 'express'
import { uploadDocument } from '../controllers/documentController';

const router = Router();
router.post('/createDocument', uploadDocument)

export default router