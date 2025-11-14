-- DropForeignKey
ALTER TABLE "documentChunks" DROP CONSTRAINT "documentChunks_documentId_fkey";

-- AddForeignKey
ALTER TABLE "documentChunks" ADD CONSTRAINT "documentChunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
