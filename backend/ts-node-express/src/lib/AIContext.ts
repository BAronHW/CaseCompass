export abstract class AiContext {
    private client;
    private modelName: string;

    constructor(AiInstance:any, apiKey: string, modelName: string) {
        this.client = new AiInstance({ apiKey });
        this.modelName = modelName;
    }

    public async getEmbeddings(inputText: string){
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

    public getClient(){
        return this.client;
    }

    public getModelName(){
        return this.modelName;
    }
}