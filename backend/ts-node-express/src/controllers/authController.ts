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
    
    // More robust token extraction
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

        res.status(201).json({
            message:'User registered',
            newUser: newUser
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
        
        const accessToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1m' });
        const refreshToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1d' });

        res
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite:'strict' })
        .header('Authorization', accessToken)
        .json({user: user});
        return
    }
    catch(error){
        res.status(500).json({error: 'Internal server error'});
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    
} 