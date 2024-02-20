import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import dotenv from "dotenv";
import fs from "fs";
import {
  connectMongoClient,
  disconnectMongoClient,
} from "./utils/mongoClient.js";
import { generateStandaloneQuestion } from "./page/index.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "@xenova/transformers";

// Specify a custom location for models (defaults to '/models/').
env.localModelPath = "./models/";
// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;

dotenv.config();

const text = fs.readFileSync(process.env.DOCUMENT, "utf-8");
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  separators: ["\n\n", "\n", " ", ""],
  chunkOverlap: 50,
});

console.log("Splitting text document into chunks...");
console.time("Text splitting completed in");
const output = await splitter.createDocuments([text]);
console.timeEnd("Text splitting completed in");

const client = await connectMongoClient();
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_COLLECTION_NAME;
const collection = client.db(dbName).collection(collectionName);

console.log("Inserting documents into MongoDB Atlas collection...");
console.time("Document insertion completed in");
/* await MongoDBAtlasVectorSearch.fromDocuments(
  output,
  new HuggingFaceTransformersEmbeddings({
    modelName: process.env.EMBEDDING_HF_MODEL_NAME,
  }),
  {
    collection,
    indexName: "default", // The name of the Atlas search index. Defaults to "default"
    textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
    embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
  },
); */
console.timeEnd("Document insertion completed in");

console.log("Running template question generation...");

console.time("Completed in");

await generateStandaloneQuestion();

console.timeEnd("Completed in");

await disconnectMongoClient();
console.log("Done");
