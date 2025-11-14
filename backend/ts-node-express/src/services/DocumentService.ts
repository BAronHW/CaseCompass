import { db } from "../lib/prismaContext.js";
import { jobQueue } from "../lib/bullMQContext.js";
import { getPreSignedUrl } from "../lib/getPreSignedUrl.js";
import { Response } from "../models/models.js";
import { s3 } from "../lib/s3Context.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export class DocumentService {

    public async getAllDocuments(userId: number) {
        const userObj = await db.user.findUnique({
            where: { 
                id: userId 
            }
        });

        if (!userObj) {
            const errorResponse = Response.createErrorResponse(
                'User not found',
                404,
                'USER_NOT_FOUND'
            );
            throw errorResponse;
        }

        const allDocuments = await db.document.findMany({
            include: {
                tags: true
            },
            where: {
                uid: userObj.uid 
            }
        });

        if (!allDocuments || allDocuments.length === 0) {
            const errorResponse = Response.createErrorResponse(
                'No documents found',
                404,
                'NO_DOCUMENTS_FOUND'
            );
            throw errorResponse;
        }

        const response = Response.createSuccessResponse(
            'Documents retrieved successfully',
            { documents: allDocuments }
        );

        return response;
    }

    public async uploadDocument(
        userId: number,
        name: string,
        size: number,
        file: string
    ) {
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const errorResponse = Response.createErrorResponse(
                'User not found',
                404,
                'USER_NOT_FOUND'
            );
            throw errorResponse;
        }

        try {
            await jobQueue.add(
                'uploadDocumentToS3',
                {
                    name,
                    size,
                    file,
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

            const response = Response.createSuccessResponse(
                'Document upload job queued successfully',
                { userId }
            );

            return response;
        } catch (error) {
            console.error('Error queuing upload job:', error);
            const errorResponse = Response.createErrorResponse(
                'Failed to queue document upload',
                500,
                'QUEUE_ERROR'
            );
            throw errorResponse;
        }
    }

    public async getDocumentById(documentId: number) {
        
        const foundDocument = await db.document.findUnique({
            include: {
                tags: true
            },
            where: { 
                id: documentId 
            }
        });

        if (!foundDocument) {
            const errorResponse = Response.createErrorResponse(
                'Document not found',
                404,
                'DOCUMENT_NOT_FOUND'
            );
            throw errorResponse;
        }

        try {
            // TODO: add a layer of caching here later
            const objectUrl = await getPreSignedUrl(foundDocument.key);

            const response = Response.createSuccessResponse(
                'Document retrieved successfully',
                {
                    document: foundDocument,
                    objectUrl
                }
            );

            return response;
        } catch (error) {
            const errorResponse = Response.createErrorResponse(
                'Failed to generate document URL',
                500,
                'URL_GENERATION_ERROR'
            );
            throw errorResponse;
        }
    }

    public async deleteDocument(docId: number) {
        try {

            const foundDocument = await db.document.findUnique({
                where: {
                    id: docId
                }
            })

            if (!foundDocument) {
                const errorResponse = Response.createErrorResponse(
                    'Cant find document',
                    400,
                    'DOCUMENT_ERROR'
                );
                throw errorResponse;
            }

            const bucketName = process.env.BUCKET_NAME;
            const bucketParams = { Bucket: bucketName, Key: foundDocument.key };
            const data = await s3.send(new DeleteObjectCommand(bucketParams))
            const documentToDelete = await db.document.delete({
                where: {
                    id: docId
                }
            })

            const response = Response.createSuccessResponse(
                'Document deleted successfully',
                {
                    document: data,
                    documentToDelete
                }
            );

            return response

        } catch (error: any) {

            const errorResponse = Response.createErrorResponse(
                'Failed to delete document URL',
                500,
                'URL_GENERATION_ERROR'
            );
            throw errorResponse;
            
        }
    }
}