/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "name",
ADD COLUMN     "content" TEXT DEFAULT '',
ADD COLUMN     "title" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "documentComments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "documentComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentComments_documentId_key" ON "documentComments"("documentId");

-- AddForeignKey
ALTER TABLE "documentComments" ADD CONSTRAINT "documentComments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
