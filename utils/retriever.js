import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import dotenv from "dotenv";
import { connectMongoClient } from "./mongoClient.js";

dotenv.config();

let retriever;

try {
  const client = await connectMongoClient();
  const dbName = process.env.MONGODB_DB_NAME;
  const collectionName = process.env.MONGODB_COLLECTION_NAME;
  const collection = client.db(dbName).collection(collectionName);

  console.log("Retrieving documents from MongoDB Atlas collection...");
  console.time("Document retrieve completed in");
  const vectorStore = new MongoDBAtlasVectorSearch(
    new HuggingFaceTransformersEmbeddings({
      modelName: process.env.EMBEDDING_HF_MODEL_NAME,
    }),
    {
      collection,
      indexName: "default", // The name of the Atlas search index. Defaults to "default"
      textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
      embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
    },
  );

  retriever = vectorStore.asRetriever();

  console.timeEnd("Document retrieve completed in");
} catch (e) {
  console.error(e);
}

export { retriever };
