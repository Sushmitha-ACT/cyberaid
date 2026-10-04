import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamText, generateText } from "ai";

const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const MODELS = [
  { provider: "google", id: "gemini-3.1-pro-preview" },
  { provider: "google", id: "gemini-3.8-flash" },
  { provider: "google", id: "gemini-3.7-flash" },
  { provider: "google", id: "gemini-3.6-flash" },
  { provider: "google", id: "gemini-3.5-flash" },
  { provider: "google", id: "gemini-flash-latest" },
  { provider: "google", id: "gemini-pro-latest" },
  { provider: "groq", id: "llama-3.2-11b-vision-preview" },
  { provider: "groq", id: "llama-3.1-70b-versatile" },
  { provider: "groq", id: "llama3-8b-8192" },
];

function getModel(config: { provider: string; id: string }) {
  if (config.provider === "google") {
    return googleProvider(config.id);
  }
  return groqProvider(config.id);
}

export async function generateObjectWithFallback(options: any): Promise<any> {
  let lastError: any;
  for (const modelConfig of MODELS) {
    try {
      const model = getModel(modelConfig);
      return await generateObject({ ...options, model, maxRetries: 0 });
    } catch (e: any) {
      console.warn(`[AI Fallback] Model ${modelConfig.id} failed: ${e.statusCode ?? e.message}`);
      lastError = e;
      if (e.statusCode === 429 || e.statusCode === 401 || (e.message && e.message.toLowerCase().includes('quota'))) {
        continue; // try next model on rate limit or invalid key
      }
    }
  }
  throw lastError;
}

export async function streamTextWithFallback(options: any): Promise<any> {
  let lastError: any;
  for (const modelConfig of MODELS) {
    try {
      const model = getModel(modelConfig);
      return await streamText({ ...options, model, maxRetries: 0 });
    } catch (e: any) {
      console.warn(`[AI Fallback] Streaming model ${modelConfig.id} failed: ${e.statusCode ?? e.message}`);
      lastError = e;
      if (e.statusCode === 429 || e.statusCode === 401 || (e.message && e.message.toLowerCase().includes('quota'))) {
        continue;
      }
    }
  }
  throw lastError;
}

export async function generateTextWithFallback(options: any): Promise<any> {
  let lastError: any;
  for (const modelConfig of MODELS) {
    try {
      const model = getModel(modelConfig);
      return await generateText({ ...options, model, maxRetries: 0 });
    } catch (e: any) {
      console.warn(`[AI Fallback] Model ${modelConfig.id} failed: ${e.statusCode ?? e.message}`);
      lastError = e;
      if (e.statusCode === 429 || e.statusCode === 401) continue;
    }
  }
  throw lastError;
}
