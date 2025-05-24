import OpenAI from "openai";
import 'dotenv/config';
/**
 * 
 * TODO:
 * 1. Make the context check if the input is something it doesnt have and need to reach into the db context
 * 
 */
export class OpenAIFunctions {
    public client: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
        
        if (!apiKey) {
            throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY or OPENAI_KEY environment variable.');
        }

        this.client = new OpenAI({
            apiKey: apiKey,
        });
    }

    public async getEmbeddings(inputText: string): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
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

        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw new Error('Unable to get the embeddings of the input text: ' + error);
        }
    }

}