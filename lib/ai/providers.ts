import { createOpenAI } from "@ai-sdk/openai";
import { customProvider, gateway } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";
import { FREE_OPENROUTER_MODELS } from "./tiers";

// ── OpenRouter client (for free models) ───────────────────────────────────────
// OpenRouter only supports Chat Completions API, not the Responses API.
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": "https://masidy.com",
    "X-Title": "Masidy",
  },
});

// ── Test provider ─────────────────────────────────────────────────────────────
export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

// ── Main model resolver ───────────────────────────────────────────────────────
export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  // Route OpenRouter free models through OpenRouter Chat Completions API
  if (FREE_OPENROUTER_MODELS.has(modelId)) {
    return openrouter.languageModel(modelId);
  }

  // All paid models go through Vercel AI Gateway
  return gateway.languageModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return gateway.languageModel(titleModel.id);
}
