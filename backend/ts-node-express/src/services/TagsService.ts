import { GoogleGenAI } from "@google/genai";

export class TagsService {
    private genAI: GoogleGenAI

    constructor(genAI: GoogleGenAI) {
        this.genAI = genAI;
    }

    public generateTagForDocument() {
        return null;
    }
}