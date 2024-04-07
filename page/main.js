//@ts-check
// ----------------- Chatbot related code -------------------

import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
	RunnablePassthrough,
	RunnableSequence,
} from "@langchain/core/runnables";
import { env as xenova } from "@xenova/transformers";
import dotenv from "dotenv";
import { combineDocuments } from "../utils/combineDocuments.js";
import retriever from "../utils/retriever.js";

//----- Xenova transformer settings to use local models with HuggingFace instead of remote ones -----
// Specify a custom location for models (defaults to '/models/').
xenova.localModelPath = "./models/";

// Disable the loading of remote models from the Hugging Face Hub:
xenova.allowRemoteModels = false;

// Setting env file location
dotenv.config();

// Main exported function:
// 1. Starts by setting the model to use (ChatOllama in this case with a model set in .env)
// 2. Declares the standalone question template with a custom {question} field.
//    This field will contain the user input
// 3. Declares the answer template with {context} and {question} (RAG)
// 4. Sets up the question chain using RunnableSequence (pipe could also have been used here)
// 5. Sets up the retriever chain to get a list of objects matching standalone_question
// 6. Sets up the answer chain (Similar as the question chain)
// 7. Combines the 3 chain pieces in a RunnableSequence passing values accordingly
// 8. Invokes the chain by passing user's question
// 9. Logs out the response (answers the question)

/**
 * Function that generates an answer by using a standalone question
 *
 * @async
 * @param {string} question
 * @returns {Promise<string>} Returns the response of the question
 */
export async function generateStandaloneQuestion(question) {
	// Creates the chat model to use (set in the .env file)
	const llm = new ChatOllama({
		model: process.env.CHAT_OLLAMA_MODEL_NAME,
	});

	// Standalone question template
	// This is used to tell the model to generate a template given user's question
	const standaloneQuestionTemplate =
		"Given a question, convert it to a standalone question. question: {question} standalone question:";

	// Defines question template with variables ({question} in this case)
	// Note that variables can be specified or inferred
	// For more info: https://js.langchain.com/docs/modules/model_io/prompts/quick_start#create-a-prompt-template
	const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
		standaloneQuestionTemplate,
	);

	// Answer template
	// Similarly to the question template. This is used to set the model persona and pass context and question
	const answerTemplate = `You are an expert e precise documentation bot who can answer a given question about Javascript based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to read MDN documentation on the site. Don't try to make up an answer. Always speak as if you were chatting to a programmer. Provide code examples where needed.
context: {context}
question: {question}
answer:`;

	// Defines answer template with variables
	const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

	// Question chain piece
	// Parses the standalone question as a string
	// For more info on StringOutputParser: https://js.langchain.com/docs/modules/model_io/output_parsers/types/string
	const standaloneQuestionChain = RunnableSequence.from([
		standaloneQuestionPrompt,
		llm,
		new StringOutputParser(),
	]);

	// Retriever chain piece
	// Takes the question string from the previous chain piece and retrieves matching objects
	const retrieverChain = RunnableSequence.from([
		// Takes the previous result (from standalone question's chain)
		// and pass only the standalone_question string from the object
		(prevResult) => prevResult.standalone_question,
		// Passes the string to the retriever which will
		// return an array of objects matching the query
		retriever,
		// Combines the objects in a string
		combineDocuments,
	]);

	// Answer chain piece
	// Parses the answer as a string
	const answerChain = RunnableSequence.from([
		answerPrompt,
		llm,
		new StringOutputParser(),
	]);

	// Complete chain
	// Generates the answer given a question
	const chain = RunnableSequence.from([
		{
			standalone_question: standaloneQuestionChain, // standalone_question contains the result from the first chain piece
			original_input: new RunnablePassthrough(), // original_input contains the user's question that will be passed to the answer chain piece
		},
		{
			context: retrieverChain, //
			question: ({ original_input }) => original_input.question,
		},
		answerChain,
	]);

	const response = await chain.invoke({
		question,
	});

	return response;
}

// ---------------- Webpage related code -------------------

document.addEventListener("DOMContentLoaded", () => {});
document.addEventListener("submit", (e) => {
	e.preventDefault();
	progressConversation();
});

async function progressConversation() {
	const userInput = document.getElementById("card-input");
	const chatbotConversation = document.getElementById(
		"chatbot-conversation-container",
	);
	if (chatbotConversation) {
		/** @type {any} */ const question = userInput.value.trim(); // Trim whitespace from input

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

			const response = await generateStandaloneQuestion(question);

			console.log(response);
			console.log("Done");

			// Add AI message
			const newAiSpeechBubble = document.createElement("div");
			newAiSpeechBubble.classList.add("speech", "speech-ai", "row");
			chatbotConversation.appendChild(newAiSpeechBubble);
			newAiSpeechBubble.textContent = response;
			chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
		}
	}
}
