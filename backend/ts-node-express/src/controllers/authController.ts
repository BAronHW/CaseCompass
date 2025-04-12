import { error } from "console";
import { Request, Response, NextFunction } from "express";
import { db } from "../lib/prismaContext";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {

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
        const uuid = crypto.randomUUID()

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
        
        const accessToken = jwt.sign({ user }, jwtSecret as string, { expiresIn: '1h' });
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

const refresh = async (req: Request, res: Response, next: NextFunction) => {

} 