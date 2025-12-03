import { Request, Response, NextFunction } from "express";
import { db } from "../lib/prismaContext.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config.js';
import { loginUserSchema, registerUserSchema } from "../validationSchemas/authValidationSchemas.js";
import { AuthService } from "../services/AuthService.js";

/**
 * TODO:
 * 1. refactor to use transactions to ensure atomic mutations\
 * 2. refactor to put both tokens in http only cookies
 */

export const protectedRoute = (req: Request, res: Response) => {
    res.json({message: "welcome to protected route"})
    return
}

export const registerUser = async (req: Request, res: Response) => {
    try{

        const {name, email, password} = req.body;

        await registerUserSchema.validate(req.body)

        const authService = new AuthService();
        const response = await authService.registerUser(name, email, password);

        res.status(response.statusCode).json(response.body);
        return;

    }
    catch(error: any){

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
        return;

    }

}

export const loginUser = async (req: Request, res: Response) => {
    try {
        await loginUserSchema.validate(req.body);

        const { email, password } = req.body;

        const authService = new AuthService();
        const response = await authService.loginUser(email, password);

        if (!response.body.data) {
            res.status(500).json({
                success: false,
                error: 'Invalid response from service'
            });
            return;
        }

        const { accessToken, refreshToken } = response.body.data;
        
        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            })
            .cookie('Authorization', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000
            })
            .status(response.statusCode)
            .json(response.body);
        return;

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
        return;
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ success: false, error: "Missing refresh token" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ success: false, error: "Server configuration error" });
            return;
        }

        const decoded = (() => {
            try {
                return jwt.verify(refreshToken, jwtSecret) as { userForToken: { id: number; email: string } };
            } catch {
                return null;
            }
        })();

        if (!decoded) {
            res.status(401).json({ success: false, error: "Invalid refresh token" });
            return;
        }

        const user = await db.user.findUnique({
            where: { id: decoded.userForToken.id }
        });

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ success: false, error: "Token revoked or invalid" });
            return;
        }

        const newAccessToken = jwt.sign(
            { userForToken: { id: user.id, email: user.email } },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.cookie('Authorization', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        })
        .status(200)
        .json({ success: true, message: 'Token refreshed' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.removeHeader('Authorization');
        res.clearCookie('refreshToken', { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.status(200).json({ message: 'Successfully logged out' });
        return 
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout process' });
        return 
    }
}