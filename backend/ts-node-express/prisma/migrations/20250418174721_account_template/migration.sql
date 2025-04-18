-- CreateTable
CREATE TABLE "accountTemplate" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "accountTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToaccountTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DocumentToaccountTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountTemplate_ownerId_key" ON "accountTemplate"("ownerId");

-- CreateIndex
CREATE INDEX "_DocumentToaccountTemplate_B_index" ON "_DocumentToaccountTemplate"("B");

-- AddForeignKey
ALTER TABLE "accountTemplate" ADD CONSTRAINT "accountTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToaccountTemplate" ADD CONSTRAINT "_DocumentToaccountTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToaccountTemplate" ADD CONSTRAINT "_DocumentToaccountTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "accountTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
