import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 500,
	separators: ["\n\n", "\n", " ", ""],
	chunkOverlap: 50,
});

/**
 * Function used to split given text in an array of strings
 *
 * @async
 * @param {string} text - Original text string to split
 * @returns {Promise<any>} splitted text  TODO: Fix type
 */
export async function splitDocument(text) {
	const output = await splitter.createDocuments([text]);
	return output;
}
