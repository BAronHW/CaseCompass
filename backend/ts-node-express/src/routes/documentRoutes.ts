import { Router } from 'express'
import { analyzeContract, deleteDocument, getAllDocuments, getDocumentById, uploadDocument } from '../controllers/documentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { upload } from '../middlewares/upload.js';

const router = Router();
router.post('/createDocument', verifyToken , upload.single('file'), uploadDocument);
router.get('/', verifyToken, getAllDocuments);
router.get('/:documentId', verifyToken, getDocumentById)
router.post('/analyzeDocument', verifyToken, analyzeContract)
router.delete('/:documentId', verifyToken, deleteDocument);

export default router