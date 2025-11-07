import { GoogleGenAI } from "@google/genai"
import { db } from "../lib/prismaContext.js"
import { Response } from "../models/models.js"

class TagService {

    private genAI: GoogleGenAI
    
    constructor(genAI: GoogleGenAI){
        this.genAI = genAI
    }

    public async GenerateTag() {

    }

    public async AddTag() {

    }

    public async EditTag() {

    }

    public async DeleteTag() {

    }

    public async GetTag() {

    }

    public async GetAllTags() {
        
    }

    public async AttachTagToDoc(tagId: number, docId: number) {
        const foundDoc = await db.document.findUnique({
            where: {
                id: docId
            }
        });

        const foundTag = await db.tags.findUnique({
            where: {
                id: tagId
            }
        });

        if (!foundDoc) {
            const errorResponse = Response.createErrorResponse(
                'Document not found',
                404,
                'DOCUMENT_NOT_FOUND'
            );
            throw errorResponse;
        }

        if (!foundTag) {
            const errorResponse = Response.createErrorResponse(
                'Tag not found',
                404,
                'TAG_NOT_FOUND'
            );
            throw errorResponse;
        }

        const updatedDoc = await db.document.update({
            where: {
                id: docId
            },
            data: {
                tags: {
                    connect: {
                        id: tagId
                    }
                }
            }
        });

        return updatedDoc;
    }
}