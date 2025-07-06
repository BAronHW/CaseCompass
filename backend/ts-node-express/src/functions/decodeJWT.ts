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
    if (!jwtString) {
      throw new Error('No token provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Check if token has Bearer prefix and remove it
    const token = jwtString.startsWith('Authorization ')
      ? jwtString.substring(14)
      : jwtString;

    console.log(token, 'here is the token');
    console.log(secret, 'here is the secret')
    const verifiedToken = jwt.verify(token, secret) as JWTPayload;
    return verifiedToken;
  } catch (error) {
    console.error('JWT decode error:', error);
    throw error;
  }
}