import { NextFunction, Request, Response } from "express";
import { jobQueue } from "../lib/bullMQContext";

export const uploadDocument = async (req: Request, res: Response) => {

    const { name, size, file, uid } = req.body;
    // @ts-ignore
    await jobQueue.add('uploadDocumentToS3', 
        {
            name: name, 
            size: size, 
            file: file, 
            uid: uid
        },
        {
            removeOnComplete: {
                age: 3600,
                count: 100,
            },
            removeOnFail: {
                age: 24 * 3600
            }
        }

    )

    res.status(200).json({message: 'Document has been uploaded successfully'});

    

}

export const deleteDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const updateDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const analyzeSingleDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const batchAnalyzeDocument = (req: Request, res: Response, next: NextFunction) => {
    
}

