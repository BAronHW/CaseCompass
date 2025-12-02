import { EmbedContentResponse, GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
})

interface Sentence {
    combined_sentence_embedding: number[];
    distance_to_next?: number;
}

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

class SemanticChunker {

  public async chunk(content: string) {
    const sentencesArray = this.splitContentIntoSentences(content);
    const sentenceMap = this.arrayToHashmap(sentencesArray);
    const combinedNeighbours = this.combineNeighbours(1, sentenceMap);
    const embeddingsMap = await this.embedCombinedSentences(combinedNeighbours);

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
      const end = Math.min(entries.length - 1, index + n);
      const entriesWithinBuffer = entries.slice(start, end - 1);
      return [
          Number(entry[0]),
          entriesWithinBuffer.map(([_, value]) => value).join(' ')
        ];
    }))

    return Object.values(combinedMap).map(val => val);

  }

  private async embedCombinedSentences(combinedStrings: string[]): Promise<Record<string, any>> {
    const promises = combinedStrings.map(async (text) => {
        const result = await gemini.models.embedContent({
            model: 'text-embedding-004',
            contents: [{
                parts: [{ text }]
            }],
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });
        return [text, result.embeddings];
    });
    
    const entries = await Promise.all(promises);
    return Object.fromEntries(entries);
  }

  private calculateCosineDistances(sentences: Sentence[]): {
    distances: number[];
    sentences: Sentence[];
} {
    const pairs = sentences.slice(0, -1).map((_, i) => [sentences[i], sentences[i + 1]] as const);
    
    const distances = pairs.map(([curr, next]) =>
        this.cosineSimilarity(
            curr.combined_sentence_embedding,
            next.combined_sentence_embedding
        )
    );

    const sentencesWithDistances = sentences.map((sentence, i) => ({
        ...sentence,
        distance_to_next: distances[i]
    }));

    return { distances, sentences: sentencesWithDistances };
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
}