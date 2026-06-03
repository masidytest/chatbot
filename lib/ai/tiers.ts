/**
 * Masidy Plan Tiers
 *
 * free  — Masidy only (Groq, $0 cost)
 * plus  — Masidy + Code + Mini + Speed ($5/month)
 * pro   — Everything including Flash + Pro ($10/month)
 */

export type UserPlan = "free" | "plus" | "pro";

// Which models each plan can access
export const modelsByPlan: Record<UserPlan, string[]> = {
  free: ["masidy"],
  plus: ["masidy", "deepseek/deepseek-v3.2", "openai/gpt-oss-20b", "xai/grok-4.1-fast-non-reasoning"],
  pro: [
    "masidy",
    "moonshotai/kimi-k2.5",        // Flash — most expensive, Pro only
    "deepseek/deepseek-v3.2",       // Code
    "openai/gpt-oss-20b",           // Mini
    "openai/gpt-oss-120b",          // Pro model
    "xai/grok-4.1-fast-non-reasoning", // Speed
  ],
};

export function canUseModel(plan: UserPlan, modelId: string): boolean {
  return modelsByPlan[plan].includes(modelId);
}

export const planNames: Record<UserPlan, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

// Which plan is needed for a model — used in upgrade prompts
export function requiredPlanForModel(modelId: string): UserPlan {
  if (modelsByPlan.free.includes(modelId)) return "free";
  if (modelsByPlan.plus.includes(modelId)) return "plus";
  return "pro";
}

export const upgradeMessage: Record<string, string> = {
  "moonshotai/kimi-k2.5":
    "Masidy Flash is available on the Pro plan ($10/month). Upgrade at masidy.com.",
  "openai/gpt-oss-120b":
    "Masidy Pro is available on the Plus plan ($5/month) or Pro plan ($10/month). Upgrade at masidy.com.",
  "deepseek/deepseek-v3.2":
    "Masidy Code is available on the Plus plan ($5/month). Upgrade at masidy.com.",
  "openai/gpt-oss-20b":
    "Masidy Mini is available on the Plus plan ($5/month). Upgrade at masidy.com.",
  "xai/grok-4.1-fast-non-reasoning":
    "Masidy Speed is available on the Plus plan ($5/month). Upgrade at masidy.com.",
};
