// take in corpus using ocr
// chunk the corpus to process in batches
// run the contract analysis prompt over the batches
import { GoogleGenAI } from "@google/genai";
import { contractAnalysisBody } from "../models/models.js";
import { db } from "../lib/prismaContext.js";
import { Response } from "../models/models.js";

export class ContractAnalysisService {
    private genAI: GoogleGenAI

    constructor(genAI: GoogleGenAI){
        this.genAI = genAI
    }

    private ChunkContract() {
        
        return;
    }

    private CreateContractAnalysisPrompt(body: contractAnalysisBody) {
        const systemMessage = `You are an expert legal contract analyst with deep expertise in contract law, legal language interpretation, and risk assessment. Your role is to perform comprehensive analysis of legal contracts and agreements to identify risks, ambiguities, and potential legal issues.

        ## Your Responsibilities:
        1. **Legal Risk Analysis**: Identify problematic clauses, unfair terms, legal loopholes, and potential liability exposures
        2. **Clarity & Ambiguity**: Assess clarity of language, identify vague or ambiguous terms that could lead to disputes
        3. **Compliance**: Check for adherence to relevant laws, regulations, and industry standards
        4. **Balance of Terms**: Evaluate fairness and balance of obligations, rights, and remedies between parties

        ## Analysis Framework:
        For each contract, provide:
        - **Critical Issues**: Terms that create significant legal risk, liability, or are potentially unenforceable
        - **High Priority**: Clauses that should be renegotiated or clarified before signing
        - **Medium Priority**: Areas of concern that may cause issues in certain scenarios
        - **Low Priority**: Minor suggestions for improved clarity or standard practice alignment
        - **Summary**: Overall risk assessment, key red flags, and strategic recommendations

        ## Output Format:
        Structure your analysis with clear severity levels, specific clause or section references when possible, plain-language explanations of legal implications, and actionable recommendations for each finding.

        Be thorough, precise, and focus on practical business and legal risks.`;

        const userMessage = `Please analyze the following legal contract:

        ## Contract Document:
        ${body.body}

        ## Specific Clauses/Sections of Interest:
        ${body.methodDetails}

        Provide a comprehensive legal analysis following the framework outlined in your instructions.`;

        return {
            systemMessage,
            userMessage
        };
    }

    public async AnalyzeContract(
        docId: number,
        temperature: number,
        maxTokens?: number
    ) {
        const document = await db.documentChunks.findMany({
            where: {
                documentId: docId
            }
        })

        const sortedDoc = document.sort((a, b) => a.id - b.id);
        const documentText = sortedDoc.map(document => document.content).join('');
        // need to refactor this to either group chunked data into correct order or just take the full document string and pass it
        const body: contractAnalysisBody = {
            body: documentText,
            methodDetails: 'find logical weaknesses in this text'
        }

        const { systemMessage, userMessage } = this.CreateContractAnalysisPrompt(body);
        const res = await this.genAI.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: systemMessage + userMessage,
                config: {
                    maxOutputTokens: maxTokens,
                    temperature: temperature
                }
        })

        const response = Response.createSuccessResponse(
            'Analyzed contract successfully',
            {
                res
            },
            200
        );
        return response;
    }
}