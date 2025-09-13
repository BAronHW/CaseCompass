import { GoogleGenAI } from "@google/genai";
import { db } from "../lib/prismaContext.js";
import { DocumentChunk } from "../interfaces/DocumentChunk.js";

export async function chunkRetrieval(numberOfNearestNeighbours: number, messageBody: string, genAI: GoogleGenAI): Promise<DocumentChunk[]> {
    if (typeof numberOfNearestNeighbours !== 'number') {
        throw new Error('numberOfNearestNeighbours needs to be a number');
    }
    const messageBodyEmbedding = await genAI.models.embedContent({
        model: 'text-embedding-004',
        contents: [{
            parts: [{ text: messageBody }]
        }],
        config: {
            taskType: "SEMANTIC_SIMILARITY",
        }
    });
    
    const embeddingArray = messageBodyEmbedding.embeddings?.[0]?.values;

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