import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import dotenv from "dotenv";
import { connectMongoClient } from "./mongoClient.js";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Collection, MongoClient } from "mongodb";

dotenv.config();


/**
 * Retrieves documents from DB conllection to be used in chain
 *
 * @async
 * @throws {Error} - Throws an error if either one of the env variables is not set
 * @throws {Error} - Throws an error if cannot retrieve document embeddings from DB
 * @returns {Promise<VectorStoreRetriever>} Returns vectorized documents
 */
export default async function retrieve() {
  try {
    /** @type {MongoClient}*/
    const client = await connectMongoClient();

    /** @type {string|undefined}*/
    const dbName = process.env.MONGODB_DB_NAME;
    /** @type {string|undefined}*/
    const collectionName = process.env.MONGODB_COLLECTION_NAME;

    /** @type {string|undefined}*/
    const modelName = process.env.EMBEDDING_HF_MODEL_NAME;

    if (!dbName || !collectionName) {
      throw new Error("Error while trying to retrieve documents: DB Env variables not set");
    } else {
      /** @type {Collection}*/
      const collection = client.db(dbName).collection(collectionName);

      console.log("Retrieving documents from MongoDB Atlas collection...");
      console.time("Document retrieve completed in");

      /** @type {MongoDBAtlasVectorSearch}*/
      const vectorStore = new MongoDBAtlasVectorSearch(
        new HuggingFaceTransformersEmbeddings({
          modelName: modelName,
        }),
        {
          collection,
          indexName: "default", // The name of the Atlas search index. Defaults to "default"
          textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
          embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
        },
      );

      console.timeEnd("Document retrieve completed in");
      return vectorStore.asRetriever();

    }
  } catch (e) {
    console.error("Error while retrieving documents from DB", e);
    throw e;
  }

}
