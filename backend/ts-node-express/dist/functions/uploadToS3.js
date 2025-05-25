"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto = __importStar(require("crypto"));
const s3Context_js_1 = require("../lib/s3Context.js");
const prismaContext_js_1 = require("../lib/prismaContext.js");
const uploadToS3 = async (jobData) => {
    try {
        if (!jobData.file || !jobData.uid) {
            throw new Error('Missing required fields: file and uid are required');
        }
        const buffer = Buffer.from(jobData.file, 'base64');
        const uniqueName = crypto.randomBytes(32).toString('hex');
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: uniqueName,
            Body: buffer,
            ContentType: "application/pdf",
        };
        const command = new client_s3_1.PutObjectCommand(params);
        await s3Context_js_1.s3.send(command);
        await prismaContext_js_1.db.document.create({
            data: {
                key: uniqueName,
                title: jobData.name,
                size: jobData.size,
                uid: jobData.uid,
            }
        });
        return {
            key: uniqueName,
            name: jobData.name,
            size: jobData.size,
            uid: jobData.uid,
        };
    }
    catch (error) {
        console.error('Error in uploadToS3:', error);
        throw error;
    }
};
exports.uploadToS3 = uploadToS3;
