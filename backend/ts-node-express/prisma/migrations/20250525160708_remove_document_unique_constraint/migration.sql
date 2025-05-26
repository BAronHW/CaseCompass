-- DropIndex
DROP INDEX "documentChunks_documentId_key";

-- AlterTable
ALTER TABLE "documentChunks" ALTER COLUMN "content" SET DEFAULT '';
