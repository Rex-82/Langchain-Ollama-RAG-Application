import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 500,
	separators: ["\n\n", "\n", " ", ""],
	chunkOverlap: 50,
});

const loader = new DirectoryLoader(
	"/home/cardo/downloads/mdn-docs/content/files/en-us/learn/javascript/",
	{
		".md": (path) => new TextLoader(path),
	},
);
export const docs = await loader.loadAndSplit(splitter);
// console.log({ docs });
