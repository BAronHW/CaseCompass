-- DropIndex
DROP INDEX "User_refreshToken_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "refreshToken" DROP DEFAULT;
