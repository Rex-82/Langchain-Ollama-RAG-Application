// ----------------- Chatbot related code -------------------

import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

import dotenv from "dotenv";
dotenv.config();

export async function generateStandaloneQuestion(client) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    const namespace = "langchain.test2";
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);

    console.log("Retrieving documents from MongoDB Atlas collection...");
    console.time("Document retrieve completed in");
    const vectorStore = new MongoDBAtlasVectorSearch(new OllamaEmbeddings(), {
      collection,
      indexName: "scrimba_index", // The name of the Atlas search index. Defaults to "default"
      textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
      embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
    });

    const retriever = vectorStore.asRetriever();
    console.timeEnd("Document retrieve completed in");

    console.log(retriever);

    const llm = new ChatOllama({
      model: "llama2",
    });

    const standaloneQuestionTemplate =
      "Given a question, convert it to a standalone question. question: {question} standalone question:";

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate,
    );

    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(llm)
      .pipe(new StringOutputParser().pipe(retriever));

    const response = await standaloneQuestionChain.invoke({
      question:
        "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
    });

    console.log(response);

    await client.close();
    console.log("Done");
  }
}

// ---------------- Webpage related code -------------------

// document.addEventListener("DOMContentLoaded", () => {});
/*
document.addEventListener("submit", (e) => {
  e.preventDefault();
  progressConversation();
});

async function progressConversation() {
  const userInput = document.getElementById("card-input");
  const chatbotConversation = document.getElementById(
    "chatbot-conversation-container",
  );
  const question = userInput.value.trim(); // Trim whitespace from input

  if (!question) {
    // Focus on the input area if textArea is empty
    userInput.focus();
  } else {
    userInput.value = "";

    // Add human message
    const newHumanSpeechBubble = document.createElement("div");
    newHumanSpeechBubble.classList.add("speech", "speech-human", "row");
    chatbotConversation.appendChild(newHumanSpeechBubble);
    newHumanSpeechBubble.textContent = question;
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;

    // Add AI message
    const result = "AI response";
    const newAiSpeechBubble = document.createElement("div");
    newAiSpeechBubble.classList.add("speech", "speech-ai", "row");
    chatbotConversation.appendChild(newAiSpeechBubble);
    newAiSpeechBubble.textContent = result;
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
  }
}
*/
