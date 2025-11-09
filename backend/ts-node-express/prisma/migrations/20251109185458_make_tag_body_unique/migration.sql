/*
  Warnings:

  - A unique constraint covering the columns `[body]` on the table `Tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tags_body_key" ON "Tags"("body");
