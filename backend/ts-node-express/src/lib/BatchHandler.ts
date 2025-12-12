import { LocalLLM } from "./LocalLLM.js";

export class BatchHandler<T> {
    private buffer: T[] = [];
    private batchSize: number;
    private llm: LocalLLM;

    constructor(batchSize: number, llm: LocalLLM) {
        this.batchSize = batchSize;
        this.llm = llm;
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

    public async process(): Promise<number[][]> {
        const batches = this.splitBuffer();

        const batchResults = await batches.reduce(
            async (accPromise, batch, index) => {
                console.log(`Processing batch: ${index + 1}/${batches.length}`);
                const acc = await accPromise;

                const results = await Promise.all(
                    batch.map(async (item) => {
                        const text = typeof item === 'string'
                            ? item
                            : (item as any).pageContent ?? JSON.stringify(item);

                        return this.llm.getEmbeddings(text);
                    })
                );

                return [...acc, ...results];
            },
            Promise.resolve([] as number[][])
        );

        return batchResults;
    }

    private splitBuffer(): T[][] {
        return this.buffer.reduce((resultArray: T[][], item, index) => {
            const chunkIndex = Math.floor(index / this.batchSize);
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
        }, []);
    }
}