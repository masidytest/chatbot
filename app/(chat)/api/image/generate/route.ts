import { auth } from "@/app/(auth)/auth";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";
import { fal } from "@fal-ai/client";

const CREDIT_COST = { schnell: 5, dev: 15, pro: 25 } as const;

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

const ASPECT_MAP: Record<string, string> = {
  "1:1": "square",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
};

export async function POST(request: Request) {
  const apiKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Image generation not configured." }, { status: 500 });
  }

  fal.config({ credentials: apiKey });

  const session = await auth();
  const userId = session?.user?.id;

  let body: { prompt?: string; aspectRatio?: string; quality?: "schnell" | "dev" | "pro" };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Determine quality — guests and free users get schnell only
  let quality: keyof typeof MODELS = "schnell";
  if (userId && body.quality && body.quality !== "schnell") {
    const userPlan = await getUserPlan(userId);
    if (body.quality === "pro" && userPlan !== "pro") {
      return Response.json({ error: "Professional quality requires the Pro plan." }, { status: 403 });
    }
    if (body.quality === "dev" && userPlan === "free") {
      return Response.json({ error: "High quality requires the Plus plan." }, { status: 403 });
    }
    quality = body.quality;
  }

  // Credit check for paid quality
  if (userId && quality !== "schnell") {
    const cost = CREDIT_COST[quality];
    const credits = await getUserCredits(userId);
    if (credits < cost) {
      return Response.json({ error: `Not enough credits (need ${cost}).` }, { status: 403 });
    }
  }

  const image_size = (ASPECT_MAP[body.aspectRatio ?? "1:1"] ?? "square") as
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
      return Response.json({ error: `No image returned: ${JSON.stringify(data)}` }, { status: 500 });
    }

    // Deduct credits for paid quality
    if (userId && quality !== "schnell") {
      deductUserCredits(userId, CREDIT_COST[quality]).catch(() => {});
    }

    return Response.json({ url: imageUrl, quality });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[image/generate]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
