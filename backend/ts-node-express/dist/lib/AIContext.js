"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiContext = void 0;
class AiContext {
    constructor(AiInstance, apiKey, modelName) {
        this.client = new AiInstance({ apiKey });
        this.modelName = modelName;
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
    getClient() {
        return this.client;
    }
    getModelName() {
        return this.modelName;
    }
}
exports.AiContext = AiContext;
