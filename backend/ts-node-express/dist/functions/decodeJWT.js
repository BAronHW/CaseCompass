"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = decodeJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
function decodeJWT(jwtString) {
    try {
        const token = jwtString && jwtString.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!token) {
            throw new Error('No token provided');
        }
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is not set');
        }
        const verifiedToken = jsonwebtoken_1.default.verify(token, secret);
        return verifiedToken;
    }
    catch (error) {
        console.error('JWT decode error:', error);
        throw error;
    }
}
