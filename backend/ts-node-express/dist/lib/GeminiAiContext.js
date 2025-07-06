import { AiContext } from "./AIContext.js";
import { GoogleGenAI } from "@google/genai";
export class GeminiAiContext extends AiContext {
    constructor(apiKey) {
        super(GoogleGenAI, apiKey, 'gemini-embedding-exp-03-07');
    }
    async getEmbeddings(inputText) {
        try {
            if (!inputText.trim()) {
                throw new Error('Input text cannot be empty');
            }
            const response = await this.getClient().models.embedContent({
                model: this.getModelName(),
                contents: inputText,
                config: {
                    taskType: "SEMANTIC_SIMILARITY",
                }
            });
            console.log('Embeddings generated successfully:', response.embeddings);
            return response.embeddings;
        }
        catch (error) {
        }
    }
}
