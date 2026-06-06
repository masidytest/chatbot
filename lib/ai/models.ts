export const DEFAULT_CHAT_MODEL = "masidy";

export const titleModel = {
  id: "moonshotai/kimi-k2.5",
  name: "Masidy Flash",
  provider: "moonshotai",
  description: "Fast model for title generation",
  gatewayOrder: ["fireworks", "bedrock"],
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
  openrouter?: boolean; // routed via OpenRouter, not Vercel Gateway
};

export const chatModels: ChatModel[] = [
  // ── Free models (no credits, no plan required) ────────────────────────────
  {
    id: "masidy",
    name: "Masidy",
    provider: "custom",
    description: "Free · Web search, images, weather, stocks, YouTube, memory and more",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "Masidy Nano",
    provider: "openrouter",
    description: "Free · Fast everyday assistant — same model as Mini, zero credits",
    openrouter: true,
  },
  {
    id: "openai/gpt-oss-120b:free",
    name: "Masidy Core",
    provider: "openrouter",
    description: "Free · Strong reasoning and analysis — same model as Max, zero credits",
    openrouter: true,
  },
  {
    id: "poolside/laguna-m.1:free",
    name: "Masidy Build",
    provider: "openrouter",
    description: "Free · Best free coding agent — debugging, code generation, refactoring",
    openrouter: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Masidy Vision",
    provider: "openrouter",
    description: "Free · Reads images and documents — vision understanding, analysis",
    openrouter: true,
  },
  {
    id: "poolside/laguna-xs.2:free",
    name: "Masidy Think",
    provider: "openrouter",
    description: "Free · Compact, fast coding assistant — quick fixes and explanations",
    openrouter: true,
  },

  // ── Paid models (credits required) ───────────────────────────────────────
  {
    id: "moonshotai/kimi-k2.5",
    name: "Masidy Flash",
    provider: "moonshotai",
    description: "Pro · Most capable — reads images, 262K context, coding, vision, tools",
    gatewayOrder: ["fireworks", "bedrock"],
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "Masidy Code",
    provider: "deepseek",
    description: "Plus · Best for coding, debugging, technical analysis — 164K context",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "Masidy Mini",
    provider: "openai",
    description: "Plus · Fast reasoning, tool use, 131K context — great for everyday tasks",
    gatewayOrder: ["groq", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "Masidy Max",
    provider: "openai",
    description: "Plus · Strongest open-weight reasoning — complex analysis and research",
    gatewayOrder: ["fireworks", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Masidy Speed",
    provider: "xai",
    description: "Plus · Fastest model — reads images, 1M context, instant responses",
    gatewayOrder: ["xai"],
  },
];

// Static capabilities
const staticCapabilities: Record<string, ModelCapabilities> = {
  // Free OpenRouter models
  "masidy":                              { tools: true,  vision: false, reasoning: true },
  "openai/gpt-oss-20b:free":             { tools: true,  vision: false, reasoning: true },
  "openai/gpt-oss-120b:free":            { tools: true,  vision: false, reasoning: true },
  "poolside/laguna-m.1:free":            { tools: true,  vision: false, reasoning: true },
  "google/gemma-4-31b-it:free":          { tools: true,  vision: true,  reasoning: false },
  "poolside/laguna-xs.2:free":           { tools: true,  vision: false, reasoning: true },
  // Paid Gateway models
  "moonshotai/kimi-k2.5":               { tools: true,  vision: true,  reasoning: true },
  "deepseek/deepseek-v3.2":             { tools: true,  vision: false, reasoning: true },
  "openai/gpt-oss-20b":                 { tools: true,  vision: false, reasoning: true },
  "openai/gpt-oss-120b":                { tools: true,  vision: false, reasoning: true },
  "xai/grok-4.1-fast-non-reasoning":    { tools: true,  vision: true,  reasoning: false },
};

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  // Return static capabilities for all known models — no API call needed
  return staticCapabilities;
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
        description: "",
        capabilities: {
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
          reasoning: m.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
