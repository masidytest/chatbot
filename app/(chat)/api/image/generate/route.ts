import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";
import { fal } from "@fal-ai/client";

// Credit costs per generation
const CREDIT_COST = {
  schnell: 5,   // Free — 5 credits
  dev:     15,  // Plus — 15 credits
  pro:     25,  // Pro — 25 credits
} as const;

// fal.ai model IDs
const MODELS = {
  schnell: "fal-ai/flux/schnell",  // Fast, free tier
  dev:     "fal-ai/flux/dev",      // High quality
  pro:     "fal-ai/flux-pro/v1.1", // Professional
} as const;

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

  const apiKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Image generation not configured." }, { status: 500 });
  }

  fal.config({ credentials: apiKey });

  let body: {
    prompt: string;
    aspectRatio?: string;
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

  const userPlan = await getUserPlan(session.user.id);
  const quality: keyof typeof MODELS = body.quality ?? PLAN_MODEL[userPlan] ?? "schnell";

  if (quality === "pro" && userPlan !== "pro") {
    return Response.json({ error: "Professional quality requires the Pro plan. Upgrade at masidy.com/pricing" }, { status: 403 });
  }
  if (quality === "dev" && userPlan === "free") {
    return Response.json({ error: "High quality requires the Plus plan. Upgrade at masidy.com/pricing" }, { status: 403 });
  }

  const cost = CREDIT_COST[quality];
  const credits = await getUserCredits(session.user.id);

  if (userPlan !== "free" && credits < cost) {
    return Response.json({
      error: `Not enough credits. This generation costs ${cost} credits. Top up at masidy.com/pricing`,
    }, { status: 403 });
  }

  try {
    const aspectRatioMap: Record<string, string> = {
      "1:1":  "square",
      "16:9": "landscape_16_9",
      "9:16": "portrait_16_9",
      "4:3":  "landscape_4_3",
      "3:4":  "portrait_4_3",
    };
    const image_size = (aspectRatioMap[body.aspectRatio ?? "1:1"] ?? "square") as "square" | "landscape_16_9" | "portrait_16_9" | "landscape_4_3" | "portrait_4_3";

    const result = await fal.subscribe(MODELS[quality], {
      input: {
        prompt: body.prompt,
        image_size,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "jpeg" as const,
        ...(quality === "schnell" ? { num_inference_steps: 4 } : {}),
        ...(quality === "dev" ? { num_inference_steps: 28, guidance_scale: 3.5 } : {}),
      },
    });

    // fal.ai returns { images: [{ url, width, height }] }
    const data = result.data as { images?: Array<{ url: string }> };
    const imageUrl = data?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("[image/generate] no image in response:", JSON.stringify(result));
      return Response.json({ error: "Generation failed. Please try again." }, { status: 500 });
    }

    if (userPlan !== "free") {
      deductUserCredits(session.user.id, cost).catch(() => {});
    }

    return Response.json({
      url: imageUrl,
      quality,
      cost: userPlan === "free" ? 0 : cost,
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[image/generate] fal error:", msg);
    return Response.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
