import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { db } from "../lib/prismaContext";
import { emitWarning } from "process";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(400).json({message: 'no auth header'});
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
        if (error instanceof jwt.TokenExpiredError) {
            const decodedExpiredAccessToken = jwt.decode(token);

            // @ts-ignore
            if (!decodedExpiredAccessToken || !decodedExpiredAccessToken.userForToken || !decodedExpiredAccessToken.userForToken.id) {
                res.status(401).json({ message: 'Invalid token format' });
                return;
            }

            // @ts-ignore
            const userId = decodedExpiredAccessToken.userForToken.id;

            const currentUser = await db.user.findUnique({
                where:{
                    // @ts-ignore
                    id: userId
                }
            })

            if (!currentUser || !currentUser.refreshToken) {
                res.status(401).json({ 
                    message: 'Token has expired',
                    redirect_addr: '/login'
                });
                return;
            }

            try {
                jwt.verify(currentUser.refreshToken, jwtSecret)

                const userForToken = {
                    id: currentUser.id,
                    email: currentUser.email,
                };

                const newAccessToken = jwt.sign({ userForToken }, jwtSecret, { expiresIn: '1h' });
                console.log(newAccessToken)

                // @ts-ignore
                req.user = { userForToken };
                res.setHeader('x-new-token', newAccessToken);
                next();
            } catch (error) {

                res.status(401).json({
                    message: 'Token has expired',
                    redirect_addr: '/login'
                })
            } 
        } 
        else if (error instanceof jwt.JsonWebTokenError) {
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