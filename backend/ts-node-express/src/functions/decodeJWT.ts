import jwt from 'jsonwebtoken';
import 'dotenv/config.js';

interface JWTPayload {
    userForToken: {
        id: number;
        email: string;
    };
    iat?: number;
    exp?: number;
    [key: string]: any;
}

export function decodeJWT(jwtString: string): JWTPayload {
    try {
        const token = jwtString && jwtString.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!token) {
            throw new Error('No token provided');
        }

        if (!secret) {
            throw new Error('JWT_SECRET environment variable is not set');
        }

        const verifiedToken = jwt.verify(token, secret) as JWTPayload;
        return verifiedToken;

    } catch (error) {
        console.error('JWT decode error:', error);
        throw error;
    }
}