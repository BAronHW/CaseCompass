import { EmbedContentResponse, GoogleGenAI } from "@google/genai";

export class BatchHandler<T> {
    private buffer: T[] = []; // this is a buffer that stores all incoming requests
    private batchSize: number;
    private genAI: GoogleGenAI;
    

    constructor(batchSize: number, genAI: GoogleGenAI) {
        this.batchSize = batchSize;
        this.genAI = genAI;
    }

    public add(item: T) {
        this.buffer.push(item);
    }

    public addMany(items: T[]) {
        this.buffer.push(...items);
    }

    public clear() {
        this.buffer = [];
    }

    /**
     * This function calls the chunk method from the chunker on each inner array but the problem might be that the 
     */
    public async process(): Promise<EmbedContentResponse[]>{
    const batches = this.splitBuffer();
    
    const batchResults = await batches.reduce(
        async (accPromise, batch, index) => {
            console.log(`Processing batch:"${index}`);
            const acc = await accPromise;
            
            const results = await Promise.all(
                batch.map(async (item) => {
                    const text = typeof item === 'string'
                        ? item
                        : (item as any).pageContent ?? JSON.stringify(item);

                    return this.genAI.models.embedContent({
                        model: 'text-embedding-004',
                        contents: [{ parts: [{ text }] }],
                        config: { taskType: "SEMANTIC_SIMILARITY" }
                    });
                })
            );
            
            return [...acc, ...results];
        },
        Promise.resolve([] as any[])
    );

    return batchResults;
}

    /**
     * This function splits the buffer into multiple arrays: [Doc, Doc, Doc, Doc, Doc] -> [[Doc, Doc], [Doc, Doc], [Doc, Doc]]
     */
    private splitBuffer() {
        const result = this.buffer.reduce((resultArray: T[][], item, index) => { 
        const chunkIndex = Math.floor(index/this.batchSize)
            if(!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []
            }
            resultArray[chunkIndex].push(item)
            return resultArray
        }, [])
        return result;
    }
}