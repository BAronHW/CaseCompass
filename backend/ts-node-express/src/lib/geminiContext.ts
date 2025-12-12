import { AiContext } from "./AIContext.js";

class GeminiContext extends AiContext {

    constructor(AiInstance: any, apiKey: string, modelName: string) {
        super(AiInstance, apiKey, modelName);
    }

    getEmbeddings(inputText: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}