import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const CHAT_MODEL_NAME = "gemini-2.5-flash-lite" as const;
export const VISION_MODEL_NAME = "gemini-2.5-flash" as const;
export const EMBEDDING_MODEL_NAME = "gemini-embedding-001" as const;
export const GEMINI_EMBEDDING_DIMS = 1536;

type AiPhase = "chat" | "vision" | "embedding";
type AiModelName = typeof CHAT_MODEL_NAME | typeof VISION_MODEL_NAME | typeof EMBEDDING_MODEL_NAME;

export function logAiModelUse(phase: AiPhase, model: AiModelName) {
  console.info("[ai] using model", { phase, model });
}

export function getGeminiApiKey() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }
  return apiKey;
}

export function createGeminiProvider() {
  return createGoogleGenerativeAI({ apiKey: getGeminiApiKey() });
}

export function createGeminiEmbeddingModel() {
  return createGeminiProvider().embedding(EMBEDDING_MODEL_NAME);
}
