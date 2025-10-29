import { NextFunction, Request, Response } from "express";
import { jobQueue } from "../lib/bullMQContext.js";
import { decodeJWT } from "../functions/decodeJWT.js";
import { db } from "../lib/prismaContext.js";
import { getPreSignedUrl } from "../lib/getPreSignedUrl.js";
import { DocumentService } from "../services/DocumentService.js";

export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
    try{
        // switch to services and also need to use requestContext here
        const authToken = req.headers.authorization;

        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        const decodedAuthToken = await decodeJWT(authToken);
        
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = decodedAuthToken.userForToken.id;

        const docService = new DocumentService();
        const allDocs = await docService.getAllDocuments(userId);

        res.status(allDocs.statusCode).json(allDocs.body.data?.documents);

    } catch(error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
        return;
    }
}

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, size, file } = req.body;
        const authToken = req.headers.authorization;

        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        const decodedAuthToken = await decodeJWT(authToken);
        
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = decodedAuthToken.userForToken.id;

        const docService = new DocumentService();
        const uploadRes = await docService.uploadDocument(
            userId,
            name,
            size,
            file
        );

        res.status(uploadRes.statusCode).json(uploadRes.body.data?.userId)

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
        return;
    }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;

        const docId = parseInt(documentId);

        const docService = new DocumentService();
        const foundDoc = await docService.getDocumentById(docId);

        res.status(foundDoc.statusCode).json(foundDoc.body.data);
        
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
        return;
    }
}

// export const deleteDocument = (req: Request, res: Response, next: NextFunction) => {

// }

// export const updateDocument = (req: Request, res: Response, next: NextFunction) => {

// }

// export const analyzeSingleDocument = (req: Request, res: Response, next: NextFunction) => {

// }

// export const batchAnalyzeDocument = (req: Request, res: Response, next: NextFunction) => {
    
// }

