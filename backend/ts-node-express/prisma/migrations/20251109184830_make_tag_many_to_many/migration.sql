/*
  Warnings:

  - You are about to drop the column `documentId` on the `Tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tags" DROP CONSTRAINT "Tags_documentId_fkey";

-- AlterTable
ALTER TABLE "Tags" DROP COLUMN "documentId";

-- CreateTable
CREATE TABLE "_DocumentToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DocumentToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DocumentToTags_B_index" ON "_DocumentToTags"("B");

-- AddForeignKey
ALTER TABLE "_DocumentToTags" ADD CONSTRAINT "_DocumentToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToTags" ADD CONSTRAINT "_DocumentToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
