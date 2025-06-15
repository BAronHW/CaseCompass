import { Router } from 'express'
import { getAllDocuments, uploadDocument } from '../controllers/documentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.post('/createDocument', verifyToken ,uploadDocument)
router.get('/', verifyToken, getAllDocuments)

export default router