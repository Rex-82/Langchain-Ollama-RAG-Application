import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");

const namespace = "langchain.test";

const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

const vectorstore = await MongoDBAtlasVectorSearch.fromTexts(
  ["Hello world", "Bye bye", "What's this?"],

  [{ id: 2 }, { id: 1 }, { id: 3 }],

  new OllamaEmbeddings(),

  {
    collection,
    indexName: "default", // The name of the Atlas search index. Defaults to "default"
    textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
    embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
  },
);

const assignedIds = await vectorstore.addDocuments([
  { pageContent: "upsertable", metadata: {} },
]);

const upsertedDocs = [{ pageContent: "overwritten", metadata: {} }];

await vectorstore.addDocuments(upsertedDocs, { ids: assignedIds });

await client.close();

console.log("Done");
