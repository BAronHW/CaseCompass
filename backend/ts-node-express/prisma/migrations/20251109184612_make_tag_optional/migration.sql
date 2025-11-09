-- DropForeignKey
ALTER TABLE "Tags" DROP CONSTRAINT "Tags_documentId_fkey";

-- AlterTable
ALTER TABLE "Tags" ALTER COLUMN "documentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
