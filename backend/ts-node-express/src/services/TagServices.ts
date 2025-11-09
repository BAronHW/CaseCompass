import { GenerateContentResponse, GoogleGenAI } from "@google/genai"
import { db } from "../lib/prismaContext.js"
import { Response, ServiceResponse } from "../models/models.js"
import { userInfo } from "os"

export class TagService {

    private genAI: GoogleGenAI
    
    constructor(genAI: GoogleGenAI){
        this.genAI = genAI
    }

    public async GenerateTag(documentContent: string): Promise<ServiceResponse<string[]>> {
        const tags = await db.tags.findMany({});
        const tagTitleString = tags.map((tag) => tag.body);
        
        const systemString = `You are an expert document classifier and tag generator. Your role is to analyze documents and generate relevant, concise tags that categorize and describe the content effectively.

        ## Your Responsibilities:
        1. **Content Analysis**: Understand the main topics, themes, and subjects in the document
        2. **Tag Generation**: Create 3-7 relevant tags that accurately represent the document
        3. **Tag Quality**: Ensure tags are concise (1-3 words), descriptive, and useful for search/filtering
        4. **Consistency**: If existing tags are provided, prioritize reusing them when appropriate

        ## Tag Guidelines:
        - Use lowercase, hyphenated format (e.g., "contract-law", "real-estate")
        - Focus on: document type, subject matter, legal area, industry, key concepts
        - Avoid overly generic tags like "document" or "text"
        - Prioritize specificity and searchability

        ## Output Format:
        Return ONLY a valid JSON array of tag strings. Do not include any explanation, markdown code blocks, or additional text.

        Example output:
        ["contract-law", "employment", "non-disclosure", "legal-agreement"]
        
        CORRECT example:
        {
        "tags": ["contract-law", "employment", "non-disclosure"]
        }`;
        

            const existingTagsContext = tagTitleString && tagTitleString.length > 0 
                ? `\n\nExisting tags in the system: ${tagTitleString.join(', ')}\nPrefer reusing these tags when appropriate.`
                : '';

            const userMessage = `Analyze this document and generate appropriate tags:

        ${documentContent}${existingTagsContext}

        Return only a JSON array of tags. DO NOT wrap in markdown code blocks.`;

        const fullPrompt = `${systemString}\n\n${userMessage}`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: fullPrompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 200
            }
        });

        const responseText = response.text;


        if (!responseText) {
            const errorResponse = Response.createErrorResponse(
                'Failed to generate document URL',
                500,
                'URL_GENERATION_ERROR'
            );
            throw errorResponse;
        }
        
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
            const generatedTags = JSON.parse(cleanedText) as string[];
            const response = Response.createSuccessResponse(
                'Login successful',
                generatedTags,
                200
            );
            return response;
        } catch (error) {
            const errorResponse = Response.createErrorResponse(
                'Failed to generate document URL',
                500,
                'URL_GENERATION_ERROR'
            );
            throw errorResponse;
        }
    }

    public async EditTag(tagString: string, tagId: number) {

        try {

            const updatedTag = await db.tags.update({
                where: {
                    id: tagId,
                }, 
                data: {
                    body: tagString
                }
            })

            if (!updatedTag) {
                throw Response.createErrorResponse(
                    'Unable to update tag',
                    400,
                    `Unable to update tag with ${tagId}`
                )
            }

            return Response.createSuccessResponse(
                'Successfully updated tag',
                {
                    updatedTag
                },
                200
            );
            
        } catch (error: any) {
            
            throw Response.createErrorResponse(
                'Unable to update tag',
                400,
                `Unable to update tag with ${tagId}`
            )

        }

        

    }

    public async DeleteTag(tagId: number) {
    try {
        const deletedTag = await db.tags.delete({
            where: {
                id: tagId
            }
        });

        return Response.createSuccessResponse(
            'Successfully deleted tag', 
            {
                deletedTagId: deletedTag.id
            },
            200
        );
    } catch (error) {

        throw Response.createErrorResponse(
            'Unable to delete tag',
            404,
            'TAG_NOT_FOUND'
        );

    }
}

    public async GetTag(tagId: number) {
        const foundTag = await db.tags.findUnique({
            where: {
                id: tagId
            }
        })

        if (!foundTag) {
            const errorResponse = Response.createErrorResponse(
                'Tag not found',
                404,
                'TAG_NOT_FOUND'
            );
            throw errorResponse;
        }

        return Response.createSuccessResponse(
            'successfully found tag',
            {
                foundTag
            },
            200
        );
    }

    public async GetAllTags() {

        const allTags = await db.tags.findMany({})
        return Response.createSuccessResponse(
            'successfully got all tags',
            {
                allTags
            },
            200
        );
        
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

        return Response.createSuccessResponse(
            'successfully attached tag to doc',
            {
                updatedDoc
            },
            200
        );
    }

    public async DeleteTagFromDoc(tagId: number, docId: number) {
        const foundTag = await db.tags.findUnique({
            where: { id: tagId }
        });

        if (!foundTag) {
            throw Response.createErrorResponse(
                'Unable to find tag',
                404,
                'TAG_NOT_FOUND'
            );
        }

        try {
            const updatedDoc = await db.document.update({
                where: { id: docId },
                data: {
                    tags: {
                        disconnect: { id: tagId }
                    }
                }
            });

            return Response.createSuccessResponse(
                'Successfully deleted the tag from the document',
                updatedDoc,
                200
            );
        } catch (error) {
            throw Response.createErrorResponse(
                'Unable to find document',
                404,
                'DOCUMENT_NOT_FOUND'
            );
        }
    }
}