import { GoogleGenAI } from "@google/genai";
import { SentenceMap } from "../models/models.js";

/**
 * Final structure:
 * {
 *    sentence: string
 *    index: number
 *    combined_sentence: string
 *    combined_sentence_embedding: number[]
 * }
 */

interface SentenceNoEmbedding {
  sentence: string;
  index: number;
  combined_sentence: string;
}

interface Sentence {
  sentence: string;
  index: number;
  combined_sentence: string;
  combined_sentence_embedding: number[];
}

interface SentenceWithDistance extends Sentence {
  distance_to_next?: number;
}

interface DistanceResult {
  sentences: SentenceWithDistance[];
  distances: number[];
}

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
})


export const semanticChunker = async (content: string) => {
    const sentencesArr = splitContentIntoSentences(content);
    const combinedSentences = combineSentences(sentencesArr);
    const sentenceEmbeddings: Sentence[] = await embedSentences(combinedSentences);
    const store = calculateCosineDistanceAndStore(sentenceEmbeddings);
    const res = chunkByThreshold(store);
    return res
}

const sentencesArrToHashMap = (sentencesArr: string[]): SentenceMap => {
  const res = sentencesArr.reduce((map, sentence, index) => {
    map[index] = sentence;
    return map;
  }, {} as SentenceMap);
  
  return res;
}

const combineSentences = (sentencesArr: string[], buffer: number = 1): SentenceNoEmbedding[] => {
  const sentenceMap = sentencesArrToHashMap(sentencesArr);
  
  const combined_sentences = Object.keys(sentenceMap).map(key => {
    const index = Number(key);
    const combined_sentence = Object.keys(sentenceMap)
      .map(Number)
      .filter(i => i >= index - buffer && i <= index + buffer)
      .map(i => sentenceMap[i])
      .join(' ');
    
    return {
      sentence: sentenceMap[index],
      index,
      combined_sentence: combined_sentence
    };
  });
  return combined_sentences;
};

const embedSentences = async (sentencesArr: SentenceNoEmbedding[]): Promise<Sentence[]> => {
  return await Promise.all(sentencesArr.map(async (sentenceObj: SentenceNoEmbedding) => {
    const response = await gemini.models.embedContent({
      model: 'text-embedding-004',
      contents: [{
          parts: [{ text: sentenceObj.combined_sentence }]
      }],
      config: {
          taskType: "SEMANTIC_SIMILARITY",
      }
    });
    
    const combined_sentence_embedding = response!.embeddings![0].values || [];
    
    return {
      ...sentenceObj,
      combined_sentence_embedding
    };
  }));
}

const calculateCosineDistanceAndStore = (sentenceArr: Sentence[]): DistanceResult => {
  return sentenceArr.reduce<DistanceResult>((acc, currSentenceObj, index) => {
    if (index === sentenceArr.length - 1) {
      acc.sentences.push({ ...currSentenceObj });
      return acc;
    }

    const currentEmbedding = currSentenceObj.combined_sentence_embedding;
    const nextEmbedding = sentenceArr[index + 1].combined_sentence_embedding;
    const similarity = cosineSimilarity(currentEmbedding, nextEmbedding);
    const distance = 1 - similarity;

    acc.sentences.push({
      ...currSentenceObj,
      distance_to_next: distance
    });
    acc.distances.push(distance);

    return acc;
  }, { sentences: [], distances: [] });
};

const chunkByThreshold = (distanceResult: DistanceResult, chosenThreshold = 95) => {
  const breakpointDistanceThreshold = percentile(distanceResult.distances, chosenThreshold);
  
  const indicesAboveThreshold = distanceResult.sentences
    .map((sentence) => {
      if (sentence.distance_to_next && sentence.distance_to_next > breakpointDistanceThreshold) {
        return sentence.index;
      }
      return null;
    })
    .filter((index): index is number => index !== null);

  const chunks: string[] = [];
  // find a way to do this in a functional way
  let startIndex = 0;

  indicesAboveThreshold.forEach(breakpointIndex => {
    const group = distanceResult.sentences.slice(startIndex, breakpointIndex + 1);
    const combinedText = group.map(s => s.sentence).join(' ');
    chunks.push(combinedText);
    startIndex = breakpointIndex + 1;
  });

  if (startIndex < distanceResult.sentences.length) {
    const combinedText = distanceResult.sentences
      .slice(startIndex)
      .map(s => s.sentence)
      .join(' ');
    chunks.push(combinedText);
  }

  return {
    chunks,
    indicesAboveThreshold,
    breakpointDistanceThreshold
  };
};

const percentile = (arr: number[], p: number): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * (p / 100));
  return sorted[index];
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
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

const splitContentIntoSentences = (content: string): string[] => {
    return content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
}