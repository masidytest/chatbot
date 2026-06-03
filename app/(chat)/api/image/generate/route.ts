import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";
import Replicate from "replicate";

// Credit costs per generation
const CREDIT_COST = {
  schnell: 5,   // Free plan — 5 credits ($0.05)
  dev: 15,      // Plus plan — 15 credits ($0.15)
  pro: 25,      // Pro plan — 25 credits ($0.25)
} as const;

// Model IDs
const MODELS = {
  schnell: "black-forest-labs/flux-schnell",
  dev:     "black-forest-labs/flux-dev",
  pro:     "black-forest-labs/flux-1.1-pro",
} as const;

// Which plan can use which quality
const PLAN_MODEL: Record<string, keyof typeof MODELS> = {
  free: "schnell",
  plus: "dev",
  pro:  "pro",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    return Response.json({ error: "Image generation not configured." }, { status: 500 });
  }

  let body: {
    prompt: string;
    aspectRatio?: string;
    style?: string;
    quality?: "schnell" | "dev" | "pro";
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Determine quality based on plan
  const userPlan = await getUserPlan(session.user.id);
  const quality: keyof typeof MODELS = body.quality ?? PLAN_MODEL[userPlan] ?? "schnell";

  // Gate higher quality to paid plans
  if (quality === "pro" && userPlan !== "pro") {
    return Response.json({ error: "Pro quality requires the Pro plan. Upgrade at masidy.com/pricing" }, { status: 403 });
  }
  if (quality === "dev" && userPlan === "free") {
    return Response.json({ error: "High quality requires the Plus plan. Upgrade at masidy.com/pricing" }, { status: 403 });
  }

  // Check credits
  const cost = CREDIT_COST[quality];
  const credits = await getUserCredits(session.user.id);

  // Free plan users on schnell: first 3 generations free per day via Replicate free tier
  // Paid users: deduct credits
  if (userPlan !== "free" && credits < cost) {
    return Response.json({
      error: `Not enough credits. This generation costs ${cost} credits. Top up at masidy.com/pricing`,
    }, { status: 403 });
  }

  try {
    const replicate = new Replicate({ auth: apiKey });

    const aspectRatioMap: Record<string, string> = {
      "1:1":  "1:1",
      "16:9": "16:9",
      "9:16": "9:16",
      "4:3":  "4:3",
      "3:4":  "3:4",
    };
    const aspect_ratio = aspectRatioMap[body.aspectRatio ?? "1:1"] ?? "1:1";

    const input: Record<string, unknown> = {
      prompt: body.prompt,
      aspect_ratio,
      output_format: "webp",
      output_quality: 90,
    };

    // Add steps for schnell/dev
    if (quality === "schnell") input.num_inference_steps = 4;
    if (quality === "dev") input.num_inference_steps = 28;

    const output = await replicate.run(MODELS[quality] as `${string}/${string}`, { input });

    // Replicate returns a URL or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      return Response.json({ error: "Generation failed. Please try again." }, { status: 500 });
    }

    // Deduct credits for paid users
    if (userPlan !== "free") {
      deductUserCredits(session.user.id, cost).catch(() => {});
    }

    return Response.json({
      url: String(imageUrl),
      quality,
      cost: userPlan === "free" ? 0 : cost,
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    console.error("[image/generate]", msg);
    return Response.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
