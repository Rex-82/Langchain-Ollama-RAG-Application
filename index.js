import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { generateStandaloneQuestion } from "./page/index.js";

dotenv.config();

const text = fs.readFileSync("ricettario.txt", "utf-8");
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  separators: ["\n\n", "\n", " ", ""],
  chunkOverlap: 50,
});

console.log("Splitting text document into chunks...");
console.time("Text splitting completed in");
const output = await splitter.createDocuments([text]);
console.timeEnd("Text splitting completed in");

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const namespace = "langchain.test";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

console.log("Inserting documents into MongoDB Atlas collection...");
console.time("Document insertion completed in");
/* await MongoDBAtlasVectorSearch.fromDocuments(
  output,
  new OllamaEmbeddings(),
  {
    collection,
    indexName: "default", // The name of the Atlas search index. Defaults to "default"
    textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
    embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
  },
); */
console.timeEnd("Document insertion completed in");

await client.close();

console.log("Done");

console.log("Running template question generation...");
console.time("Completed in");
await generateStandaloneQuestion(client);
console.timeEnd("Completed in");
