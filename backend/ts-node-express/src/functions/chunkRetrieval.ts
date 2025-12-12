import { GoogleGenAI } from "@google/genai";
import { db } from "../lib/prismaContext.js";
import { DocumentChunk } from "../interfaces/DocumentChunk.js";
import { LocalLLM } from "../lib/LocalLLM.js";

export async function chunkRetrieval(numberOfNearestNeighbours: number, messageBody: string, genAI: GoogleGenAI): Promise<DocumentChunk[]> {
    if (typeof numberOfNearestNeighbours !== 'number') {
        throw new Error('numberOfNearestNeighbours needs to be a number');
    }

    const localLLM = new LocalLLM();
    const messageBodyEmbedding = await localLLM.getEmbeddings(messageBody);
    
    const embeddingArray = messageBodyEmbedding

    if (!embeddingArray || !Array.isArray(embeddingArray)) {
        throw new Error('Invalid embedding format');
    }

    const formattedVector = `[${embeddingArray.join(',')}]`;

    const relevantChunks = await db.$queryRaw<DocumentChunk[]>`
        SELECT id, content
        FROM "documentChunks"
        ORDER BY "embeddings" <-> ${formattedVector}::vector
        LIMIT ${Number(numberOfNearestNeighbours)};
    `;

    return relevantChunks;
}