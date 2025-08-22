import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
export function decodeJWT(jwtString) {
    try {
        const token = jwtString;
        const secret = process.env.JWT_SECRET;
        if (!token) {
            throw new Error('No token provided');
        }
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is not set');
        }
        const verifiedToken = jwt.verify(token, secret);
        return verifiedToken;
    }
    catch (error) {
        console.error('JWT decode error:', error);
        throw error;
    }
}
