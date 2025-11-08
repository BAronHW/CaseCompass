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

export async function ChunkPDF(docs: Document<Record<string, any>>[]): Promise<Document[]> {
    try {

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1024,
            chunkOverlap: 20,
        });

        const chunkedDocuments = await Promise.all(
            docs.map(async (doc) => {
                return await splitter.splitDocuments([
                    new Document({
                        pageContent: doc.pageContent,
                        metadata: { ...doc.metadata }
                    })
                ]);
            })
        );

        return chunkedDocuments.flat();

    } catch (error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error;
    }
}