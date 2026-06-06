/**
 * Masidy Plan Tiers
 *
 * free  — Masidy only (Groq, $0 cost). No credits needed.
 * plus  — $5/month → 500 credits/month + access to Code, Mini, Speed, Pro
 * pro   — $10/month → 1200 credits/month + access to ALL models incl. Flash
 *
 * Credits: 1 credit = $0.01
 * Top-ups available any time: $5=500cr, $10=1200cr, $25=3500cr
 * Credits roll over — never expire.
 */

export type UserPlan = "free" | "plus" | "pro";

// Monthly credit allocation per plan (granted on signup + each renewal)
export const creditsByPlan: Record<UserPlan, number> = {
  free: 0,      // free model costs nothing
  plus: 500,    // $5/month → 500 credits
  pro: 1200,    // $10/month → 1200 credits
};

// Credits consumed per message per model (1 credit = $0.01)
export const creditCostByModel: Record<string, number> = {
  // Free — zero cost
  "masidy": 0,
  "openai/gpt-oss-20b:free": 0,
  "openai/gpt-oss-120b:free": 0,
  "poolside/laguna-m.1:free": 0,
  "google/gemma-4-31b-it:free": 0,
  "poolside/laguna-xs.2:free": 0,
  // Paid Gateway models
  "deepseek/deepseek-v3.2": 1,
  "openai/gpt-oss-20b": 1,
  "openai/gpt-oss-120b": 1,
  "xai/grok-4.1-fast-non-reasoning": 1,
  "moonshotai/kimi-k2.5": 3,
};

// OpenRouter free model IDs — available on all plans at zero cost
export const FREE_OPENROUTER_MODELS = new Set([
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "poolside/laguna-m.1:free",
  "google/gemma-4-31b-it:free",
  "poolside/laguna-xs.2:free",
]);

// Which models each plan can access
export const modelsByPlan: Record<UserPlan, string[]> = {
  free: [
    "masidy",
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "poolside/laguna-m.1:free",
    "google/gemma-4-31b-it:free",
    "poolside/laguna-xs.2:free",
  ],
  plus: [
    "masidy",
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "poolside/laguna-m.1:free",
    "google/gemma-4-31b-it:free",
    "poolside/laguna-xs.2:free",
    "deepseek/deepseek-v3.2",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "xai/grok-4.1-fast-non-reasoning",
  ],
  pro: [
    "masidy",
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "poolside/laguna-m.1:free",
    "google/gemma-4-31b-it:free",
    "poolside/laguna-xs.2:free",
    "moonshotai/kimi-k2.5",
    "deepseek/deepseek-v3.2",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "xai/grok-4.1-fast-non-reasoning",
  ],
};

export function canUseModel(plan: UserPlan, modelId: string): boolean {
  return modelsByPlan[plan].includes(modelId);
}

export function creditCostForModel(modelId: string): number {
  return creditCostByModel[modelId] ?? 1;
}

export const planNames: Record<UserPlan, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

// Which plan is needed for a model — used in badges + upgrade prompts
export function requiredPlanForModel(modelId: string): UserPlan {
  if (modelsByPlan.free.includes(modelId)) return "free";
  if (modelsByPlan.plus.includes(modelId)) return "plus";
  return "pro";
}

export const upgradeMessage: Record<string, string> = {
  "moonshotai/kimi-k2.5":
    "Masidy Flash requires the Pro plan ($10/month). Upgrade at masidy.com to unlock it.",
  "openai/gpt-oss-120b":
    "Masidy Max requires the Plus plan ($5/month). Upgrade at masidy.com to unlock it.",
  "deepseek/deepseek-v3.2":
    "Masidy Code requires the Plus plan ($5/month). Upgrade at masidy.com to unlock it.",
  "openai/gpt-oss-20b":
    "Masidy Mini requires the Plus plan ($5/month). Upgrade at masidy.com to unlock it.",
  "xai/grok-4.1-fast-non-reasoning":
    "Masidy Speed requires the Plus plan ($5/month). Upgrade at masidy.com to unlock it.",
};

// Top-up packages — one-time purchases
export const topUpPackages = [
  { id: "topup_500",  credits: 500,  price: 5,  label: "$5",  bonus: "" },
  { id: "topup_1200", credits: 1200, price: 10, label: "$10", bonus: "Best value" },
  { id: "topup_3500", credits: 3500, price: 25, label: "$25", bonus: "+500 bonus" },
] as const;
