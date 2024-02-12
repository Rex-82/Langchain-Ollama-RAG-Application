import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

const text = fs.readFileSync("ricettario.txt", "utf-8");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  separators: ["\n\n", "\n", " ", ""],
  chunkOverlap: 50,
});

const output = await splitter.createDocuments([text]);

console.log(output);

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");

const namespace = "langchain.test";

const [dbName, collectionName] = namespace.split(".");

const collection = client.db(dbName).collection(collectionName);

const embeddings = new OllamaEmbeddings({ model: "llama2" });

const vectorstore = new MongoDBAtlasVectorSearch(
  embeddings,

  {
    collection,
    indexName: "default", // The name of the Atlas search index. Defaults to "default"
    textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
    embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
  },
);

const transformedOutput = await Promise.all(
  output.map(async (doc) => {
    console.log(`Embedding document`);

    const embedding = await embeddings.embedDocuments([doc.pageContent]);

    console.log(`Document embedded`);

    return {
      pageContent: doc.pageContent,

      embedding: embedding,

      metadata: {},
    };
  }),
);

console.log(transformedOutput);

await vectorstore.addDocuments(transformedOutput);

await client.close();

console.log("Done");
