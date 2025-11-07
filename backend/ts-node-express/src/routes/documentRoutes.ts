import { Router } from 'express'
import { analyzeContract, getAllDocuments, getDocumentById, uploadDocument } from '../controllers/documentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();
router.post('/createDocument', verifyToken ,uploadDocument);
router.get('/', verifyToken, getAllDocuments);
router.get('/:documentId', verifyToken, getDocumentById)
router.post('/analyzeDocument', verifyToken, analyzeContract)

export default router