/**
 *  take a pdf buffer and write into a temporary file
    try and load the file from the temp file path
    once loaded delete the tempfile path
 */
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { join } from "path";
import { tmpdir } from "os";
import { Document } from "@langchain/core/documents";
import { unlinkSync, writeFileSync } from "fs";
export async function ChunkPDF(pdfBuffer) {
    let tempFilePath = null;
    try {
        tempFilePath = join(tmpdir(), `temp_pdf_${Date.now()}.pdf`);
        writeFileSync(tempFilePath, pdfBuffer);
        const loader = new PDFLoader(tempFilePath, {
            splitPages: true,
        });
        const docs = await loader.load();
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500, // Increased from 50 for more meaningful chunks
            chunkOverlap: 50, // Increased from 1 for better context preservation
        });
        const chunkedDocuments = await Promise.all(docs.map(async (doc) => {
            return await splitter.splitDocuments([
                new Document({
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
                unlinkSync(tempFilePath);
            }
            catch (unlinkError) {
                console.warn('Warning: Could not delete temp file:', unlinkError);
            }
        }
    }
}
