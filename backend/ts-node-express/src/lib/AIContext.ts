export abstract class AiContext {
    private client;
    private modelName: string;

    constructor(AiInstance:any, apiKey: string, modelName: string) {
        this.client = new AiInstance({ apiKey });
        this.modelName = modelName;
    }

    public async embeddString() {}

    public async getEmbeddings(inputText: string){}

    public getClient(){
        return this.client;
    }

    public getModelName(){
        return this.modelName;
    }
}