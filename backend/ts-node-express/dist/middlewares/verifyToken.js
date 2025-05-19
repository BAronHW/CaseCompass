"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config.js");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || authHeader == undefined) {
        res.json({ redirectAddr: 'http://localhost:5173/login' });
        return;
    }
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7).trim()
        : authHeader.trim();
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not set');
        res.status(500).json({ message: 'Server configuration error' });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, jwtSecret);
        // @ts-ignore
        req.user = decodedToken;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                message: 'Token has expired'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                message: 'Invalid token',
                redirect_addr: '/login'
            });
            return;
        }
        else {
            console.error('Token verification error:', error);
            res.status(500).json({ message: 'Error processing token' });
            return;
        }
    }
};
exports.verifyToken = verifyToken;
