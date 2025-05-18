/**
 * take a pdf buffer and
 */
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Blob } from "buffer";

export async function ChunkPDF(pdfBuffer: Buffer){
    try {

        const blob = new Blob([pdfBuffer]);   
        const loader = new PDFLoader(blob);
        const docs = await loader.load();

    }catch(error) {
        console.log('Error processing PDF Buffer: ', error);
        throw error
    }
}