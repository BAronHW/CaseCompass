"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIFunctions = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
/**
 *
 * TODO:
 * 1. Make the context check if the input is something it doesnt have and need to reach into the db context
 *
 */
class OpenAIFunctions {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY or OPENAI_KEY environment variable.');
        }
        this.client = new openai_1.default({
            apiKey: apiKey,
        });
    }
    async getEmbeddings(inputText) {
        try {
            if (!inputText.trim()) {
                throw new Error('Input text cannot be empty');
            }
            const responseEmbeddings = await this.client.embeddings.create({
                model: "gpt-4.1",
                input: inputText,
                encoding_format: "float",
            });
            console.log('Embeddings generated successfully:', {
                model: responseEmbeddings.model,
                usage: responseEmbeddings.usage,
                dimensions: responseEmbeddings.data[0]?.embedding?.length || 0
            });
            return responseEmbeddings;
        }
        catch (error) {
            console.error('Error generating embeddings:', error);
            throw new Error('Unable to get the embeddings of the input text: ' + error);
        }
    }
}
exports.OpenAIFunctions = OpenAIFunctions;
