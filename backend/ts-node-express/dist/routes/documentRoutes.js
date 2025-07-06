import { Router } from 'express';
import { getAllDocuments, getDocumentById, uploadDocument } from '../controllers/documentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const router = Router();
router.post('/createDocument', verifyToken, uploadDocument);
router.get('/', verifyToken, getAllDocuments);
router.get('/:documentId', verifyToken, getDocumentById);
export default router;
