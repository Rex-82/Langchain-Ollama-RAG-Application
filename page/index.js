// ----------------- Chatbot related code -------------------

import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

export async function generateStandaloneQuestion() {
  const llm = new ChatOllama({
    model: "llama2",
  });

  const standaloneQuestionTemplate =
    "Given a question, convert it to a standalone question. question: {question} standalone question:";

  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
    standaloneQuestionTemplate,
  );

  const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);

  const response = await standaloneQuestionChain.invoke({
    question:
      "What are some good february dishes? I would like to make something for my family",
  });

  console.log(response);
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
