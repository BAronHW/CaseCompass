import { Request, Response, NextFunction } from "express";
import { db } from "../lib/prismaContext";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypt from 'crypto';
import 'dotenv/config';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Use lowercase when accessing headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({ message: 'Access Denied. No Token' });
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
        
        if (decodedToken.exp! < Math.floor(Date.now() / 1000)) {
            res.status(401).json({ message: 'Token has expired' });
            return 
        }
         // @ts-ignore
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError && error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token has expired' });
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

export const protectedRoute = (req: Request, res: Response) => {
    res.json({message: "welcome to protected route"})
    return
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const {name, email, password} = req.body;

        const userHasExists = await db.user.findFirst({
            where:{
                email: email
            }
        })

        if(userHasExists){
            res.status(400).send('This user already exists!');
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uuid = crypt.randomUUID()

        const newUser = await db.user.create({
            data:{
                name: name,
                email: email,
                password: hashedPassword,
                uid: uuid

            }
        })

        const returnNewUser = {
            name: name,
            email: email,
            uuid: uuid
        }

        res.status(201).json({
            message:'User registered',
            newUser: returnNewUser
        });
        return

    }
    catch(error){
        res.status(500).json({ error: 'Internal server error' });
        return
    }

}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        console.log(req.body.email)
        const user = await db.user.findUnique({
            where:{
                email: req.body.email
            }
        })

        if(!user){
            console.log("here")
            res.status(401).json({message: 'This user does not exist please register or the credentials you have entered are wrong'})
            return
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if(!passwordMatch){
            res.status(401).json({message:'invalid credentials'});
            return
        }

        const jwtSecret = process.env.JWT_SECRET;
        
        const accessToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1d' });

        const returnUser = {
            name: user.name,
            email: user.email,
            uuid: user.uid
        } 

        res
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite:'strict' })
        .header('Authorization', accessToken)
        .json({user: returnUser});
        return
    }
    catch(error){
        res.status(500).json({error: 'Internal server error'});
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    // check if the refresh token is valid 
    // if valid return new access token
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log(req.cookies)
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
        const user = isValidRefreshToken.user;
        const newAccessToken = jwt.sign(user, jwtSecret);
        res.status(200).json({newAccessToken});
        return
    } catch (error) {
        res.status(400).json({error})
        return
    }

} 

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
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