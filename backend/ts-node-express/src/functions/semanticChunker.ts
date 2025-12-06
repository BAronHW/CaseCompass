import { GoogleGenAI } from "@google/genai";
import { Document } from "@langchain/core/documents";
import { Sentence } from "../models/models.js";

/**
 * 1. Split text into sentences
 * 2. Convert to hashmap (index → sentence)
 * 3. Combine each sentence with neighbors (buffer window)
 * 4. Embed combined sentences into vectors
 * 5. Calculate cosine distance between consecutive embeddings
 * 6. Store all distances in an array
 * 7. Find 95th percentile threshold (identifies top 5% largest jumps)
 * 8. Get indices where distance > threshold (semantic breakpoints)
 * 9. Split sentences at breakpoint indices to create chunks
 * 10. Join sentences within each chunk into final text chunks
 * 11. Return chunks with metadata (indices, threshold)
 * 
 * Result: Text split at natural topic boundaries instead of arbitrary lengths
 */

export class SemanticChunker {

  private genAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  public async chunk(content: string) {
    const sentencesArray = this.splitContentIntoSentences(content);
    const sentenceMap = this.arrayToHashmap(sentencesArray);
    const combinedNeighbours = this.combineNeighbours(1, sentenceMap);
    const embeddingsMap = await this.embedCombinedSentences(combinedNeighbours);
    const distances = this.calculateDistances(embeddingsMap);
    const threshold = this.percentile(distances, 95);
    const breakpoints = this.findBreakPoints(embeddingsMap, threshold);
    const chunks = this.createChunks(breakpoints, embeddingsMap);
    const wrappedChunks = this.wrapChunksInDocs(chunks);
    return wrappedChunks
  }

  private arrayToHashmap(sentences: string[]) {
    return sentences.reduce((acc, curr, index) => {
      acc[index] = curr;
      return acc;
    }, {} as Record<number, string>)
  }

  private combineNeighbours(
    n: number, 
    sentenceMap: Record<number, string>
  ) {

    const entries = Object.entries(sentenceMap);

    // get forward and previous entries within buffer
   const combinedMap = Object.fromEntries(entries.map((entry, index) => {
      const start = Math.max(0, index - n);
      const end = Math.min(entries.length, index + n + 1);
      const entriesWithinBuffer = entries.slice(start, end);
      return [
          Number(entry[0]),
          entriesWithinBuffer.map(([_, value]) => value).join(' ')
        ];
    }))

    return Object.values(combinedMap).map(val => val);

  }

  private async embedCombinedSentences(combinedStrings: string[]): Promise<Record<string, Sentence>> {
    const promises = combinedStrings.map(async (text, index) => {
        const result = await this.genAI.models.embedContent({
            model: 'text-embedding-004',
            contents: [{
                parts: [{ text }]
            }],
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });

        const obj: Sentence = {
          text,
          combined_sentence_embedding: result.embeddings![0].values
        }

        return [index, obj];
    });
    
    const entries = await Promise.all(promises);
    return Object.fromEntries(entries);
  }

  private calculateDistances(embeddingsMap: Record<number, Sentence>): number[] {
    const sentences = Object.values(embeddingsMap);
    
    return sentences.slice(0, -1).map((sentence, i) => {
        const nextSentence = sentences[i + 1];

        if (!sentence.combined_sentence_embedding || !nextSentence.combined_sentence_embedding) {
            throw new Error(`Missing embedding at index ${i}`);
        }

        const similarity = this.cosineSimilarity(
            sentence.combined_sentence_embedding,
            nextSentence.combined_sentence_embedding
        );

        const distance = 1 - similarity;
        
        sentence.distance_to_next = distance;

        return distance;
    });
  }

  private findBreakPoints(embeddingsMap: Record<number, Sentence>, threshold: number) {
    const sentences = Object.entries(embeddingsMap);
    const index = sentences.filter(([index, sentence]) => {
      return sentence.distance_to_next 
        ? sentence.distance_to_next > threshold 
        : false
    })
    .map(([index]) => Number(index) + 1);
    return index
  }

  private createChunks(breakpoints: number[], embeddingsMap: Record<number, Sentence>): Sentence[][] {
    const entries = Object.entries(embeddingsMap);
    
    const allBreakpoints = [0, ...breakpoints, entries.length];
    
    return allBreakpoints.slice(0, -1).map((startIndex, i) => {
        const endIndex = allBreakpoints[i + 1];
        return entries
            .slice(startIndex, endIndex)
            .map(([_, sentence]) => sentence);
    });
}

  private splitContentIntoSentences(content: string) {
    return content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same dimensions");
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

    const magnitudeA = Math.hypot(...vecA);
    const magnitudeB = Math.hypot(...vecB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private percentile(arr: number[], p: number): number {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)];
  }

  private wrapChunksInDocs(chunks: Sentence[][]): Document[] {
    return chunks.map((chunk) => {
        const text = chunk.map(sentence => sentence.text).join(' ');
        return new Document({
            pageContent: text
        });
    });
}
}