import { Document } from "@langchain/core/documents";
import { SemanticChunker } from "./semanticChunker.js";
/**
 *  take a pdf buffer and write into a temporary file
    try and load the file from the temp file path 
    once loaded delete the tempfile path
 */
export async function ChunkPDF(docs: Document<Record<string, any>>[]): Promise<Document[]> {
    try {
        const semanticChunker = new SemanticChunker(process.env.GEMINI_KEY as string);
        // might need to batch this as well
        const chunkedDocuments = await Promise.all(
            docs.map(doc => semanticChunker.chunk(doc.pageContent))
        );

        return chunkedDocuments.flat();

    } catch (error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error;
    }
}