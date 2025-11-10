-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
