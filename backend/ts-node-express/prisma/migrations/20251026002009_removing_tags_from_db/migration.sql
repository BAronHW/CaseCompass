/*
  Warnings:

  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_documentId_fkey";

-- DropTable
DROP TABLE "public"."tags";
