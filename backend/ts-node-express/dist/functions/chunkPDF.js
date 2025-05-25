"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkPDF = ChunkPDF;
const pdf_js_1 = require("@langchain/community/document_loaders/fs/pdf.js");
const buffer_1 = require("buffer");
async function ChunkPDF(pdfBuffer) {
    try {
        const blob = new buffer_1.Blob([pdfBuffer]);
        const loader = new pdf_js_1.PDFLoader(blob);
        const docs = await loader.load();
    }
    catch (error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error;
    }
}
