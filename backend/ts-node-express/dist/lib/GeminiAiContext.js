"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAiContext = void 0;
const AIContext_1 = require("./AIContext");
const genai_1 = require("@google/genai");
class GeminiAiContext extends AIContext_1.AiContext {
    constructor(apiKey) {
        super(genai_1.GoogleGenAI, apiKey, 'gemini-embedding-exp-03-07');
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
exports.GeminiAiContext = GeminiAiContext;
