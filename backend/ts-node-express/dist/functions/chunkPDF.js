"use strict";
/**
 *  take a pdf buffer and write into a temporary file
    try and load the file from the temp file path
    once loaded delete the tempfile path
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkPDF = ChunkPDF;
const textsplitters_1 = require("@langchain/textsplitters");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const path_1 = require("path");
const os_1 = require("os");
const documents_1 = require("@langchain/core/documents");
const fs_1 = require("fs");
async function ChunkPDF(pdfBuffer) {
    let tempFilePath = null;
    try {
        tempFilePath = (0, path_1.join)((0, os_1.tmpdir)(), `temp_pdf_${Date.now()}.pdf`);
        (0, fs_1.writeFileSync)(tempFilePath, pdfBuffer);
        const loader = new pdf_1.PDFLoader(tempFilePath, {
            splitPages: true,
        });
        const docs = await loader.load();
        const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 500, // Increased from 50 for more meaningful chunks
            chunkOverlap: 50, // Increased from 1 for better context preservation
        });
        const chunkedDocuments = await Promise.all(docs.map(async (doc) => {
            return await splitter.splitDocuments([
                new documents_1.Document({
                    pageContent: doc.pageContent,
                    metadata: { ...doc.metadata }
                })
            ]);
        }));
        return chunkedDocuments.flat();
    }
    catch (error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error;
    }
    finally {
        if (tempFilePath) {
            try {
                (0, fs_1.unlinkSync)(tempFilePath);
            }
            catch (unlinkError) {
                console.warn('Warning: Could not delete temp file:', unlinkError);
            }
        }
    }
}
