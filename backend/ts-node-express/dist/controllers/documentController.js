"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchAnalyzeDocument = exports.analyzeSingleDocument = exports.updateDocument = exports.deleteDocument = exports.uploadDocument = void 0;
const bullMQContext_js_1 = require("../lib/bullMQContext.js");
const uploadDocument = async (req, res) => {
    const { name, size, file, uid } = req.body;
    // @ts-ignore
    await bullMQContext_js_1.jobQueue.add('uploadDocumentToS3', {
        name: name,
        size: size,
        file: file,
        uid: uid
    }, {
        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600
        }
    });
    res.status(200).json({ message: 'Document has been uploaded successfully' });
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
