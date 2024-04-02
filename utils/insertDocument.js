import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { Collection } from "mongodb";

/**
 * Generates embeddings for given document by using defined model and
 * uploads it in the collection.
 *
 * @async
 * @param {any} document - Splitted documents to embed
 * @param {string} model - Language model name to use
 * @param {Collection} collection - MongoDB collection to push embeddings to
 * @returns {Promise<void>} Function does not return anything
 */
export async function insertDocument(document, model, collection) {
	await MongoDBAtlasVectorSearch.fromDocuments(
		document,
		new HuggingFaceTransformersEmbeddings({
			modelName: model,
		}),
		{
			collection,
			indexName: "default", // The name of the Atlas search index. Defaults to "default"
			textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
			embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
		},
	);
}
