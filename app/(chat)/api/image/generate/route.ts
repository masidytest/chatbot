import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";
import { fal } from "@fal-ai/client";

const CREDIT_COST = {
  schnell: 5,
  dev: 15,
  pro: 25,
} as const;

const MODELS = {
  schnell: "fal-ai/flux/schnell",
  dev: "fal-ai/flux/dev",
  pro: "fal-ai/flux-pro/v1.1",
} as const;

const PLAN_MODEL: Record<string, keyof typeof MODELS> = {
  free: "schnell",
  plus: "dev",
  pro: "pro",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  // Check for either env var name
  const apiKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;

  // Return clear error showing which keys are available
  if (!apiKey) {
    const available = Object.keys(process.env).filter(k => k.includes("FAL")).join(", ") || "none";
    return Response.json({
      error: `FAL key not found. Available FAL vars: ${available}`,
    }, { status: 500 });
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
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const userPlan = await getUserPlan(session.user.id);
  const quality: keyof typeof MODELS = body.quality ?? PLAN_MODEL[userPlan] ?? "schnell";

  if (quality === "pro" && userPlan !== "pro") {
    return Response.json({ error: "Professional quality requires the Pro plan." }, { status: 403 });
  }
  if (quality === "dev" && userPlan === "free") {
    return Response.json({ error: "High quality requires the Plus plan." }, { status: 403 });
  }

  const cost = CREDIT_COST[quality];
  const credits = await getUserCredits(session.user.id);

  if (userPlan !== "free" && credits < cost) {
    return Response.json({ error: `Not enough credits (need ${cost}).` }, { status: 403 });
  }

  const aspectRatioMap: Record<string, string> = {
    "1:1":  "square",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "4:3":  "landscape_4_3",
    "3:4":  "portrait_4_3",
  };
  const image_size = (aspectRatioMap[body.aspectRatio ?? "1:1"] ?? "square") as
    "square" | "landscape_16_9" | "portrait_16_9" | "landscape_4_3" | "portrait_4_3";

  try {
    const result = await fal.subscribe(MODELS[quality], {
      input: {
        prompt: body.prompt,
        image_size,
        num_images: 1,
        num_inference_steps: quality === "schnell" ? 4 : 28,
        guidance_scale: 3.5,
        enable_safety_checker: true,
        output_format: "jpeg" as const,
      },
    });

    const data = result.data as { images?: Array<{ url: string }> };
    const imageUrl = data?.images?.[0]?.url;

    if (!imageUrl) {
      return Response.json({
        error: `No image returned. Response: ${JSON.stringify(result.data)}`,
      }, { status: 500 });
    }

    if (userPlan !== "free") {
      deductUserCredits(session.user.id, cost).catch(() => {});
    }

    return Response.json({ url: imageUrl, quality, cost: userPlan === "free" ? 0 : cost });

  } catch (e) {
    // Return the REAL error message so we can see what's wrong
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
