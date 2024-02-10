import { Ollama } from "@langchain/community/llms/ollama";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
});

console.log(await ollama.invoke("Tell me 5 facts about lamas"));
