"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchAnalyzeDocument = exports.analyzeSingleDocument = exports.updateDocument = exports.deleteDocument = exports.uploadDocument = void 0;
const bullMQContext_1 = require("../lib/bullMQContext");
const decodeJWT_1 = require("../functions/decodeJWT");
const prismaContext_1 = require("../lib/prismaContext");
const uploadDocument = async (req, res) => {
    try {
        const { name, size, file } = req.body;
        const authToken = req.headers.authorization;
        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }
        const decodedAuthToken = await (0, decodeJWT_1.decodeJWT)(authToken);
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        const userId = decodedAuthToken.userForToken.id;
        const user = await prismaContext_1.db.user.findUnique({
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
        await bullMQContext_1.jobQueue.add('uploadDocumentToS3', {
            name: name,
            size: size,
            file: file,
            uid: user.uid
        }, {
            removeOnComplete: {
                age: 3600,
                count: 100,
            },
            removeOnFail: {
                age: 24 * 3600
            }
        });
        res.status(200).json({
            message: 'Document upload job queued successfully',
            userId: userId
        });
    }
    catch (error) {
        console.error('Error in uploadDocument:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.uploadDocument = uploadDocument;
const deleteDocument = (req, res, next) => {
};
exports.deleteDocument = deleteDocument;
const updateDocument = (req, res, next) => {
};
exports.updateDocument = updateDocument;
const analyzeSingleDocument = (req, res, next) => {
};
exports.analyzeSingleDocument = analyzeSingleDocument;
const batchAnalyzeDocument = (req, res, next) => {
};
exports.batchAnalyzeDocument = batchAnalyzeDocument;
