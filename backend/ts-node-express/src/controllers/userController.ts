import { NextFunction, Request, Response } from "express";
import { db } from "../lib/prismaContext.js";
import { UserWithoutPassword, UserWithPassword } from "../models/models.js";

export const findUserByUid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uuid = req.params.uuid;
        if(!uuid){
            res.status(400).json({
                message: 'no uuid in param'
            })
        };
        const user = await db.user.findUnique({
            where:{
                uid: uuid
            }
        }) as UserWithPassword;
        if(!user){
            res.status(400).json({
                message: 'unable to find user with this uuid'
            })
        }
        const {password, ...serializedUser} = user as UserWithPassword; 
        res.status(200).json({
            user: serializedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
    
}

export const findAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allUsers = await db.user.findMany() as UserWithPassword[];
        const allUsersSerialized: UserWithoutPassword[] = allUsers.map((user) => {
            const {password, ...userWithoutPassword} = user;
            return userWithoutPassword
        }) 
        res.status(200).json({
            allUsersSerialized
        }) 
    } catch (error) {
        res.status(400).json({
            error
        })
    }
}