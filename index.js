import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import { generateStandaloneQuestion } from "./page/index.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "@xenova/transformers";

// Specify a custom location for models (defaults to '/models/').
env.localModelPath = "./models/";

// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;

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
const namespace = "langchain.hf";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

console.log("Inserting documents into MongoDB Atlas collection...");
console.time("Document insertion completed in");
/* await MongoDBAtlasVectorSearch.fromDocuments(
  output,
  new HuggingFaceTransformersEmbeddings({
    modelName: "all-MiniLM-L6-v2",
  }),
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
