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
};

export const chatModels: ChatModel[] = [
  {
    id: "masidy",
    name: "Masidy",
    provider: "custom",
    description: "Free · Web search, images, weather, stocks, memory and more",
  },
  {
    id: "moonshotai/kimi-k2.5",
    name: "Masidy Flash",
    provider: "moonshotai",
    description: "Pro · Most capable — vision, coding, long context",
    gatewayOrder: ["fireworks", "bedrock"],
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "Masidy Code",
    provider: "deepseek",
    description: "Plus · Best for coding, debugging, and technical tasks",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "Masidy Mini",
    provider: "openai",
    description: "Plus · Fast and smart — great for everyday tasks",
    gatewayOrder: ["groq", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "Masidy Pro",
    provider: "openai",
    description: "Plus · Deep reasoning — best for complex questions",
    gatewayOrder: ["fireworks", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Masidy Speed",
    provider: "xai",
    description: "Plus · Fastest responses — real-time and instant",
    gatewayOrder: ["xai"],
  },
];

// Static capabilities for models that don't go through the AI Gateway.
const staticCapabilities: Record<string, ModelCapabilities> = {
  masidy: { tools: true, vision: false, reasoning: true },
  "meta/llama-3.1-8b": { tools: true, vision: false, reasoning: true },
};

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const results = await Promise.all(
    chatModels.map(async (model) => {
      // Return static capabilities for custom/local models.
      if (staticCapabilities[model.id]) {
        return [model.id, staticCapabilities[model.id]];
      }

      try {
        const res = await fetch(
          `https://ai-gateway.vercel.sh/v1/models/${model.id}/endpoints`,
          { next: { revalidate: 86_400 } }
        );
        if (!res.ok) {
          return [model.id, { tools: false, vision: false, reasoning: false }];
        }

        const json = await res.json();
        const endpoints = json.data?.endpoints ?? [];
        const params = new Set(
          endpoints.flatMap(
            (e: { supported_parameters?: string[] }) =>
              e.supported_parameters ?? []
          )
        );
        const inputModalities = new Set(
          json.data?.architecture?.input_modalities ?? []
        );

        return [
          model.id,
          {
            tools: params.has("tools"),
            vision: inputModalities.has("image"),
            reasoning: params.has("reasoning"),
          },
        ];
      } catch {
        return [model.id, { tools: false, vision: false, reasoning: false }];
      }
    })
  );

  return Object.fromEntries(results);
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
    if (!res.ok) {
      return [];
    }

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
