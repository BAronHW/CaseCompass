import { NextFunction, Request, Response } from "express";
import { jobQueue } from "../lib/bullMQContext.js";
import { decodeJWT } from "../functions/decodeJWT.js";
import { db } from "../lib/prismaContext.js";

export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
    try{
        const authToken = req.headers.authorization;

        console.log(authToken, 'authtoken');
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

        const userObj = await db.user.findUnique({
            where: {
                id: userId
            }
        })

        const userUuid = userObj?.uid;

        const allDocumentsWithUuid = await db.document.findMany({
            where: {
                uid: userUuid
            }
        })

        if (!allDocumentsWithUuid) {
            res.status(400).json({
                error: 'unable to find any Documents'
            })
        }
        
        res.status(200).json({
            allDocumentsWithUuid
        })



    } catch(error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal server error', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        })
    }
}

export const getSingleDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const authToken = req.headers.authorization;
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal server error', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        })
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

        const user = await db.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!name || !size || !file) {
            res.status(400).json({ error: 'Missing required fields: name, size, or file' });
            return;
        }

        await jobQueue.add('uploadDocumentToS3', 
            {
                name: name, 
                size: size, 
                file: file, 
                uid: user.uid
            },
            {
                removeOnComplete: {
                    age: 3600,
                    count: 100,
                },
                removeOnFail: {
                    age: 24 * 3600
                }
            }
        );

        res.status(200).json({ 
            message: 'Document upload job queued successfully',
            userId: userId 
        });

    } catch (error) {
        console.error('Error in uploadDocument:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;

        const docId = parseInt(documentId);

        const foundDocumentWithId = await db.document.findUnique({
            where: {
                id: docId
            }
        })

        if (!foundDocumentWithId) {
            res.status(400).json({ error: 'unable to find document with this Id' })
        }

        res.status(200).json({
            foundDocumentWithId
        })
        
    } catch (error: any) {
        console.log('Error in getDocumentById', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const deleteDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const updateDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const analyzeSingleDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const batchAnalyzeDocument = (req: Request, res: Response, next: NextFunction) => {
    
}

