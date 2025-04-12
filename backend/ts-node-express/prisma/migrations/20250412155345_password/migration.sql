/*
  Warnings:

  - You are about to alter the column `uid` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ALTER COLUMN "uid" SET DATA TYPE VARCHAR(255);
