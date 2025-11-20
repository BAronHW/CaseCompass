import { GoogleGenAI } from "@google/genai";
import { SentenceMap } from "../models/models.js";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
})


export const semanticChunker = async (content: string) => {

    const sentencesArr = splitContentIntoSentences(content);
    const combineSentence = combineSentences(sentencesArr);
    const sentenceEmbeddings = await embedSentences(combineSentence)
    
    
    
}

const sentencesArrToHashMap = (sentencesArr: string[]): SentenceMap => {
  const res = sentencesArr.reduce((map, sentence, index) => {
    map[index] = sentence;
    return map;
  }, {} as SentenceMap);
  
  return res;
}

const combineSentences = (sentencesArr: string[], buffer: number = 1) => {
  const sentenceMap = sentencesArrToHashMap(sentencesArr);
  
  return Object.keys(sentenceMap).map(key => {
    const index = Number(key);
    return Object.keys(sentenceMap)
      .map(Number)
      .filter(i => i >= index - buffer && i <= index + buffer)
      .map(i => sentenceMap[i])
      .join(' ');
  });
};

const embedSentences = async (sentencesArr: string[]) => {
  return await Promise.all (sentencesArr.map( async (sentence: string) => {
    return await gemini.models.embedContent({
      model: 'text-embedding-004',
      contents: [{
          parts: [{ text: sentence }]
      }],
      config: {
          taskType: "SEMANTIC_SIMILARITY",
      }
    })
  }))
}

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

const splitContentIntoSentences = (content: string) => {
    return content.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
}