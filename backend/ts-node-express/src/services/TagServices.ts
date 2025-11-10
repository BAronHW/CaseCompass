import { GoogleGenAI } from "@google/genai"
import { db } from "../lib/prismaContext.js"
import { ContractTagResponse, Response, ServiceResponse } from "../models/models.js"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Tag } from "@aws-sdk/client-s3";
import { Tags } from "@prisma/client";


export class TagService {

    private genAI: GoogleGenAI
    
    constructor(genAI: GoogleGenAI){
        this.genAI = genAI
    }

    public async GenerateTag(documentId: number): Promise<ServiceResponse<Tags[]>> {
        
        const tags = await db.tags.findMany({});
        const tagTitleString = tags.map((tag) => tag.body);

        const foundDoc = await db.document.findUnique({
            where: {
                id: documentId
            }
        })

        if (!foundDoc) {
            throw Response.createErrorResponse(
                'unable to find document',
                400
            )
        }

        const documentContent = foundDoc.content

        const contractTagSchema = {
            "type": "object",
            "description": "Tag generation for legal documents",
            "properties": {
                "tags": {
                    "type": "array",
                    "description": "Relevant tags in lowercase-hyphenated format (e.g., 'employment-contract', 'non-disclosure', 'real-estate')",
                    "items": {
                        "type": "string",
                        "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$"
                    },
                    "minItems": 3,
                    "maxItems": 7
                }
            },
            "required": ["tags"]
        }
        
        const systemMessage = `You are an expert legal document classifier. Analyze the document and generate 3-7 relevant tags in lowercase-hyphenated format.

        Focus on:
        - Document type (e.g., employment-contract, lease-agreement, nda)
        - Legal area (e.g., contract-law, real-estate, intellectual-property)
        - Key clauses (e.g., confidentiality, termination, payment-terms)
        - Industry (e.g., technology, healthcare, finance)

        ${tagTitleString.length > 0 ? `\nExisting tags: ${tagTitleString.join(', ')}\nReuse when appropriate.` : ''}`;

        const userMessage = `Analyze this legal document and generate tags:\n\n${documentContent}`;

        const fullPrompt = `${systemMessage}\n\n${userMessage}`;

        try {
            const model = new ChatGoogleGenerativeAI({
                model: "gemini-2.0-flash-001",
                apiKey: process.env.GEMINI,
                temperature: 0.3,
            });

            const modelWithStructure = model.withStructuredOutput<ContractTagResponse>(contractTagSchema);

            const result = await modelWithStructure.invoke(fullPrompt);

            const createdTagPromiseArray = result.tags.map(async (tagBody) => {
                return db.tags.upsert({
                    where: { body: tagBody },
                    update: {},
                    create: { body: tagBody }
                });
            });

            const createdTagArr = await Promise.all(createdTagPromiseArray);

            return Response.createSuccessResponse(
                'Tags generated successfully',
                createdTagArr,
                200
            );

        } catch (error) {
            throw Response.createErrorResponse(
                'Failed to generate tags',
                500,
                'TAG_GENERATION_ERROR'
            );
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