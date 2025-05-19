CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "documentChunks" (
    "id" SERIAL NOT NULL,
    "embeddings" vector,
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "documentChunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentChunks_documentId_key" ON "documentChunks"("documentId");

-- AddForeignKey
ALTER TABLE "documentChunks" ADD CONSTRAINT "documentChunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
