import { Request, Response, NextFunction } from "express";


export const createNewChat = (req: Request, res: Response) => {
    // create a new ai chat
    
    res.json({message: "welcome to protected route"})
    return;
}

export const pushToChat = (req: Request, res: Response) => {
    // push new input to chat
    res.json({message: "welcome to protected route"})
    return;}

export const deleteChat = (req: Request, res: Response) => {
    // delete a chattemplate
    res.json({message: "welcome to protected route"})
    return;
}