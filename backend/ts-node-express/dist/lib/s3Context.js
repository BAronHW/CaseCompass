"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bucketRegion = process.env.BUCKET_REGION;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
//@ts-ignore
exports.s3 = new client_s3_1.S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretAccessKey
    }
});
