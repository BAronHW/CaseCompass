import { AiContext } from "./AIContext.js";
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

class LocalLLM {
    private extractor: FeatureExtractionPipeline | null = null;
    protected modelName: string = 'mixedbread-ai/mxbai-embed-large-v1';

    private async getExtractor(): Promise<FeatureExtractionPipeline> {
        if (!this.extractor) {
            this.extractor = await pipeline('feature-extraction', this.modelName, {
                quantized: true,
            });
        }
        return this.extractor;
    }

    async getEmbeddings(inputText: string): Promise<number[]> {
        const extractor = await this.getExtractor();
        const result = await extractor(inputText, { pooling: 'cls' });
        return result.tolist()[0];
    }
}

export { LocalLLM };