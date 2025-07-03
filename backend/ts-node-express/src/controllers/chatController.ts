import { Request, Response, NextFunction } from "express";
import { decodeJWT } from "../functions/decodeJWT.js";
import { db } from "../lib/prismaContext.js";
import { determineIfQuestion } from "../lib/questionDetermine.js";

// TODO: use websockets

export const createNewChat = async (req: Request, res: Response) => {
    try {
        const authToken = req.headers.authorization;
    
        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        const decodedAuthToken = await decodeJWT(authToken);
        
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = decodedAuthToken.userForToken.id;

        const chatModel = await db.chat.create({
            data: {
                userId: userId,
            }
        })

        if(!chatModel){
            res.status(404).json({ error: 'Unable to create new chat model' });
            return;
        }
        
        res.status(201).json({
            message:{
                id: chatModel.id
            }
        })
        return;
    } catch (error) {
        console.log(error);
        throw new Error('unable to create new chat template');
    }
    
}

export const pushToChat = async (req: Request, res: Response) => {
    // need to write a module to determine if the message sent is a question or not if it is then 
    // do the rag vector search
    try {
        const authToken = req.headers.authorization;
        const { body } = req.body;
        
        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        const decodedAuthToken = await decodeJWT(authToken);
        
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = decodedAuthToken.userForToken.id;

        const foundChatTemplateModel = await db.chat.findUnique({
            where:{
                userId: userId
            }
        })

        if (!foundChatTemplateModel) {
            res.status(400).json({
                error: 'Unable to find any chat model with this userId'
            })
            return;
        }

        const isQuestion = determineIfQuestion(body);

        const foundChatId = foundChatTemplateModel?.id;



        /**
         * switch to use websockets here
         */
        if (!isQuestion) {
            
            const chatText = await db.message.create({
                data: {
                    chatId: foundChatId,
                    body: body
                }
            })

            if(!chatText){
                res.status(201).json({
                    message: 'Unable to create new chat message'
                })
                return;
            }

            res.status(201).json({
                message: {
                    id: chatText.id,
                    chatId: chatText.chatId
                }
            }
        )
        return;

        }
        
    } catch (error) {
        console.log(error)
        throw new Error('unable to create new chat message')
    }
}

export const deleteChat = async (req: Request, res: Response) => {
    try {
        const authToken = req.headers.authorization;
        const { body } = req.body;
        
        if (!authToken) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        const decodedAuthToken = await decodeJWT(authToken);
        
        if (!decodedAuthToken || !decodedAuthToken.userForToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = decodedAuthToken.userForToken.id;

        const foundChatTemplateModel = await db.chat.findUnique({
            where:{
                userId: userId
            }
        })

        if(!foundChatTemplateModel){
            res.status(400).json({
                error: 'Unable to find any chat model with this userId'
            })
            return;
        }

        const deletedChatModel = await db.chat.delete({
            where:{
                userId: userId,
            }
        })

        if(!deletedChatModel){
            res.status(400).json({
                error: 'unable to find the chat'
            })
        }

        res.status(200).json({
            message:{
                deleted: true
            }
        })
        
    } catch (error) {
        console.log(error);
        throw new Error('error with deleting a chat')
    }
    
    return;
}