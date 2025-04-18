import { NextFunction, Request, Response } from "express";
import { jobQueue } from "../lib/bullMQContext";

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {

    /**
     * body should have 
     * 1. name
     * 2. size
     * 3. file which is the file content 
     * 4. uid
     */
    const { name, size, file, uid } = req.body;
    await jobQueue.add('upload-to-s3', 
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

    

}

export const deleteDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const updateDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const analyzeSingleDocument = (req: Request, res: Response, next: NextFunction) => {

}

export const batchAnalyzeDocument = (req: Request, res: Response, next: NextFunction) => {
    
}

