// import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma.js";
// import { PrismaClient, Prisma, documentChunks } from "@prisma/client";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { db } from "./prismaContext.js";


// export const VectorStore = PrismaVectorStore.withModel<documentChunks>(db).create(
//     new OpenAIEmbeddings(),
//     {
//         prisma: Prisma,
//         tableName: "documentChunks",
//         vectorColumnName: "embeddings",
//         columns: {
//           id: PrismaVectorStore.IdColumn,
//           content: PrismaVectorStore.ContentColumn,
//         },
//     }
// )