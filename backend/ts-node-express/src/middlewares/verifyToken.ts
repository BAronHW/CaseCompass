import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.redirect('http://localhost:5173/login')
        return 
    }
    
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7).trim()
        : authHeader.trim();

    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
        console.error('JWT_SECRET is not set');
        res.status(500).json({ message: 'Server configuration error' });
        return 
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        
         // @ts-ignore
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError && error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ 
                message: 'Token has expired',
                redirect_addr: '/login'
            });
            return 
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return
        }
        else {
            console.error('Token verification error:', error);
            res.status(500).json({ message: 'Error processing token' });
            return 
        }
    }
};