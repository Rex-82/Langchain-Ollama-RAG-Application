import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import * as transformers from "@xenova/transformers";
import { checkCommandArgument } from "./utils/checkLaunchCommand.js";
import { insertDocument } from "./utils/insertDocument.js";
import { connectMongoClient } from "./utils/mongoClient.js";
import { docs } from "./utils/loadDocuments.js";

// Specify a custom location for models (defaults to '/models/').
transformers.env.localModelPath = "./models/";
// Disable the loading of remote models from the Hugging Face Hub:
transformers.env.allowRemoteModels = false;

const text = process.env.DOCUMENT
	? fs.readFileSync(process.env.DOCUMENT, "utf-8")
	: ""; // TODO: Implement better env check

dotenv.config();

/**
 * Main to wrap code logic
 *
 * @async
 * @returns {Promise<undefined>} Executes the code and returns nothing
 */
async function main() {
	if (text && checkCommandArgument() === "e") {
		console.info("Running embedding first");
		console.log("Splitting text document into chunks...");
		console.time("Text splitting completed in");
		const output = docs;
		console.timeEnd("Text splitting completed in");

		const client = await connectMongoClient();
		const dbName = process.env.MONGODB_DB_NAME || "";
		const collectionName = process.env.MONGODB_COLLECTION_NAME || "";
		const collection = client.db(dbName).collection(collectionName);
		const modelName = process.env.EMBEDDING_HF_MODEL_NAME || "";

		await insertDocument(output, modelName, collection);

		console.log("Inserting documents into MongoDB Atlas collection...");
		console.time("Document insertion completed in");
		console.timeEnd("Document insertion completed in");
		// await disconnectMongoClient();
		console.log("Done");
	}
}

main();

const app = express();

const options = {
	index: "./page/index.html",
};

app.use("/", express.static("page", options));

app.get("/*", (_, res) => {
	res.redirect("/index.html");
});

const server = app.listen(8080, () => {
	const host = server.address().address;
	const port = server.address().port;

	console.log("app is listening at http://%s:%s", host, port);
});
