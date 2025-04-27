import { Request, Response, NextFunction } from "express";
import { db } from "../lib/prismaContext";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypt from 'crypto';
import 'dotenv/config';

/**
 * TODO:
 * 1. refactor to use transactions to ensure atomic mutations\
 * 2. refactor so that instead of using refresh-tokens in cookies
 */

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
                uid: uuid,
                refreshToken:''

            }
        })

        await db.accountTemplate.create({
            data:{
                ownerId: newUser.id
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
        const user = await db.user.findUnique({
            where:{
                email: req.body.email
            }
        })

        if(!user){
            res.status(401).json({message: 'This user does not exist please register or the credentials you have entered are wrong'})
            return
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if(!passwordMatch){
            res.status(401).json({message:'invalid credentials'});
            return
        }

        const userForToken = {
            id: user.id,
            email: user.email
        }
        const jwtSecret = process.env.JWT_SECRET;
        
        const accessToken = jwt.sign({ userForToken }, jwtSecret as string, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userForToken }, jwtSecret as string, { expiresIn: '1d' });

        const returnUser = {
            name: user.name,
            email: user.email,
            uid: user.uid,
            accessToken
        }

        await db.user.update({
            where:{
                email: req.body.email
            },
            data:{
                refreshToken: refreshToken
            }
        })

        res
        .cookie('refreshToken', refreshToken, { 
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        })
        .header('Authorization', accessToken)
        .json({
            user: returnUser,
            cookieSet: true,
            cookieOptions: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            }
        });
        return
    }
    catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal server error'});
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {

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