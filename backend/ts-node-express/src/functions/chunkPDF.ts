import { Document } from "@langchain/core/documents";
import { SemanticChunker } from "./semanticChunker.js";
/**
 *  take a pdf buffer and write into a temporary file
    try and load the file from the temp file path 
    once loaded delete the tempfile path
 */
export async function ChunkPDF(
  docs: Document<Record<string, any>>[],
  concurrency: number = 3
): Promise<Document[]> {
  try {
    const semanticChunker = new SemanticChunker(process.env.GEMINI_KEY as string);
    const results: Document[] = [];

    for (let i = 0; i < docs.length; i += concurrency) {
      const batch = docs.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(doc => semanticChunker.chunk(doc.pageContent))
      );
      
      results.push(...batchResults.flat());
      
      if (i + concurrency < docs.length) {
        await sleep(100);
      }
    }

    return results;

  } catch (error) {
    console.log('Error processing PDF Buffer: ', error);
    throw error;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}