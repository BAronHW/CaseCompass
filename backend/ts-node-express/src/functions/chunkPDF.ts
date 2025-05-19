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

export async function ChunkPDF(pdfBuffer: Buffer){
    try {

        /

        const tempFilePath = join(tmpdir(), `temp_pdf_${Date.now()}.pdf`);

        const loader = new PDFLoader(tempFilePath, {
            splitPages: true,
        });

        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 50,
            chunkOverlap: 1,
        });

        const chunkedDocuments = await Promise.all(
            docs.map((doc) => {
                splitter.splitDocuments([
                    new Document({
                        pageContent: doc.pageContent,
                        metadata: {...doc.metadata}
                    })
                ])
            })
        );

        return chunkedDocuments.flat();

    }catch(error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error
    }
}