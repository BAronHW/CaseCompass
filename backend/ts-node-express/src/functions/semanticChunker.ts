import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
})

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

  public chunk(content: string) {
    const sentencesArray = this.splitContentIntoSentences(content);
    const sentenceMap = this.arrayToHashmap(sentencesArray);
    const combinedNeighbours = this.combineNeighbours(1, sentenceMap);
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

  private embedCombinedSentences() {

  }

  private splitContentIntoSentences(content: string) {
    return content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  }
}