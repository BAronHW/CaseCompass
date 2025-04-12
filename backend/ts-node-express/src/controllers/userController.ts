import { NextFunction, Request, Response } from "express";
import { db } from "../lib/prismaContext";

export const findUserByUid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await db.user.findUnique({
            where:{
                uid: req.params.uuid
            }
        })
        if(!user){
            res.status(400).json({
                message: 'unable to find user with this uuid'
            })
        }
        res.status(200).json({
            id: user?.id,
            name: user?.name,
            email: user?.email,
            uuid: user?.uid,
        })
    } catch (error) {
        res.status(400).json({error})
    }
    
}