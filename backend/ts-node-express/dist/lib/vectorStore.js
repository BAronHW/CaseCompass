"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
const prisma_1 = require("@langchain/community/vectorstores/prisma");
const client_1 = require("@prisma/client");
const openai_1 = require("@langchain/openai");
const prismaContext_1 = require("./prismaContext");
exports.VectorStore = prisma_1.PrismaVectorStore.withModel(prismaContext_1.db).create(new openai_1.OpenAIEmbeddings(), {
    prisma: client_1.Prisma,
    tableName: "documentChunks",
    vectorColumnName: "embeddings",
    columns: {
        id: prisma_1.PrismaVectorStore.IdColumn,
        content: prisma_1.PrismaVectorStore.ContentColumn,
    },
});
