import { GoogleGenAI } from "@google/genai";
import { TagService } from "../services/TagServices.js";
import { Request, Response } from "express";
import { uploadDocument } from "./documentController.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI });
const tagService = new TagService(genAI);

export const generateTag = async (req: Request, res: Response) => {
    try {

        const { documentContent } = req.body;
        const tags = await tagService.GenerateTag(documentContent);
        res.status(tags.statusCode).json(tags.body)

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
    }
}

export const getTag = async (req: Request, res: Response) => {
    try {

        const { tagId } = req.body
        const tag = await tagService.GetTag(tagId)
        res.status(tag.statusCode).json(tag.body);

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
    }
}

export const getAllTag = async (req: Request, res: Response) => {
    try {

        const tags = await tagService.GetAllTags()
        res.status(tags.statusCode).json(tags.body);

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
    }
}

export const attachTagToDoc = async (req: Request, res: Response) => {
    try {

        const { tagId, docId } = req.body
        const updatedDoc = await tagService.AttachTagToDoc(tagId,docId)
        res.status(updatedDoc.statusCode).json(updatedDoc.body);

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
    }
}

export const deleteTagFromDoc = async (req: Request, res: Response) => {
    try {

        const { tagId, docId } = req.body
        const updatedDoc = await tagService.DeleteTagFromDoc(tagId, docId)
        res.status(updatedDoc.statusCode).json(updatedDoc.body)

    } catch (error: any) {
         if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
    }
}

export const deleteTag = async (req: Request, res: Response) => {

    try {

        const { tagId } = req.body
        const deleteTag = await tagService.DeleteTag(tagId);
        res.status(deleteTag.statusCode).json(deleteTag.body);

    } catch (error: any) {
        
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;

    }

}

export const editTag = async (req: Request, res: Response) => {

    try {
        
        const { tagId, tagString } = req.body
        const editedTag = await tagService.EditTag(tagString, tagId);
        res.status(editedTag.statusCode).json(editedTag.body);

    } catch (error: any) {

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }

        if (error?.statusCode && error?.body) {
            res.status(error.statusCode).json(error.body);
            return;
        }
        res.status(500).json({ 
            success: false,
            error: error.message
        });
        return;
        
    }

}

