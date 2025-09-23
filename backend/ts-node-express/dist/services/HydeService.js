export class HydeService {
    genAI;
    constructor(genAI) {
        this.genAI = genAI;
    }
    async generateHypotheticalDocument(query, config) {
        const builtPrompt = this.buildHydePrompt(query, config.domain, config.documentType);
        try {
            const result = await this.genAI.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: builtPrompt,
                config: {
                    maxOutputTokens: config.maxTokens,
                    temperature: config.temperature
                }
            });
            const response = await result.text;
            if (!response) {
                return 'unable to generate hypothetical document';
            }
            return response;
        }
        catch (err) {
            console.log('Error generating hypothetical document', err);
            throw err;
        }
    }
    async getHypotheticalDocumentEmbedding(hypotheticalDoc) {
        const messageBodyEmbedding = await this.genAI.models.embedContent({
            model: 'text-embedding-004',
            contents: hypotheticalDoc,
        });
        return messageBodyEmbedding.embeddings?.[0]?.values;
    }
    getGenAI() {
        return this.genAI;
    }
    buildHydePrompt(query, domain, documentType) {
        return `You are an expert writer creating a ${documentType} in the ${domain} domain.

        Write a comprehensive, factual passage that would perfectly answer this question: "${query}"

        Requirements:
        - Write as if this is an excerpt from an authoritative source
        - Include specific details, facts, and explanations
        - Use professional, informative language
        - Make it 2-3 paragraphs long
        - Focus on directly answering the question
        - Don't include meta-commentary about the task

        Generate the hypothetical document:`;
    }
}
