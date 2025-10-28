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
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            })
            .cookie('Authorization', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000
            })
            .header('Authorization', accessToken)
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

export const refresh = async (req: Request, res: Response) => {

    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            res.status(400).json({message: "missing refresh token"});
            return
        }
        const jwtSecret = process.env.JWT_SECRET as string;
        const isValidRefreshToken = jwt.verify(refreshToken, jwtSecret);
        if(!isValidRefreshToken){
            res.status(400).json({message: "invalid refresh token"});
            return
        }
        
        // @ts-ignore
        const user = isValidRefreshToken.userForToken;
        const newAccessToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1h' });
        res.status(200).json({newAccessToken});
        return
    } catch (error) {
        res.status(400).json({error})
        return
    }

} 

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