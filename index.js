import fs from "fs/promises";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

try {
  const text = await fs.readFile("./ricettario.txt", "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    separators: ["\n\n", "\n", " ", "  "],
    chunkOverlap: 50,
  });

  const output = await splitter.createDocuments([text]);

  console.log(output);
} catch (err) {
  console.log(err);
}
