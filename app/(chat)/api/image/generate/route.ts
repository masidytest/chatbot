import { auth } from "@/app/(auth)/auth";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";

// Stability AI credit costs (1 credit = $0.01 on our platform)
// Stability actual cost: core=3cr, sd3.5=3.5cr, ultra=8cr
const CREDIT_COST = { standard: 3, high: 5, pro: 10 } as const;

// Stability AI style preset mapping from our UI styles
const STYLE_MAP: Record<string, string> = {
  "Photorealistic": "photographic",
  "Digital Art":    "digital-art",
  "Oil Painting":   "enhance",
  "Watercolor":     "watercolor",
  "3D Render":      "3d-model",
  "Anime":          "anime",
  "Sketch":         "line-art",
  "Cinematic":      "cinematic",
  "Minimalist":     "low-poly",
  "Abstract":       "fantasy-art",
};

// Stability AI valid aspect ratios
const ASPECT_MAP: Record<string, string> = {
  "1:1":  "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3":  "3:2",   // closest match
  "3:4":  "2:3",   // closest match
};

export async function POST(request: Request) {
  const apiKey = process.env.STABILITY_API_KEY
    ?? process.env.FLUXAPI_API_KEY
    ?? process.env.BFL_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Image generation not configured." }, { status: 500 });
  }

  const session = await auth();
  const userId = session?.user?.id;

  let body: {
    prompt?: string;
    aspectRatio?: string;
    style?: string;
    quality?: "standard" | "high" | "pro";
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
  let quality: "standard" | "high" | "pro" = "standard";
  if (userId && body.quality && body.quality !== "standard") {
    const userPlan = await getUserPlan(userId);
    if (body.quality === "pro" && userPlan !== "pro") {
      return Response.json({ error: "Professional quality requires the Pro plan." }, { status: 403 });
    }
    if (body.quality === "high" && userPlan === "free") {
      return Response.json({ error: "High quality requires the Plus plan." }, { status: 403 });
    }
    quality = body.quality;
  }

  // Credit check for paid quality
  if (userId && quality !== "standard") {
    const cost = CREDIT_COST[quality];
    const credits = await getUserCredits(userId);
    if (credits < cost) {
      return Response.json({ error: `Not enough credits (need ${cost}).` }, { status: 403 });
    }
  }

  const aspect_ratio = ASPECT_MAP[body.aspectRatio ?? "1:1"] ?? "1:1";
  const style_preset = body.style ? STYLE_MAP[body.style] : undefined;

  // Choose endpoint based on quality
  const endpoint = quality === "pro"
    ? "https://api.stability.ai/v2beta/stable-image/generate/ultra"
    : quality === "high"
    ? "https://api.stability.ai/v2beta/stable-image/generate/sd3"
    : "https://api.stability.ai/v2beta/stable-image/generate/core";

  try {
    const formData = new FormData();
    formData.append("prompt", body.prompt);
    formData.append("output_format", "jpeg");
    formData.append("aspect_ratio", aspect_ratio);
    if (style_preset) formData.append("style_preset", style_preset);
    if (quality === "high") formData.append("model", "sd3.5-medium");
    // Required dummy field for some endpoints
    formData.append("none", "");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "application/json",
        "stability-client-id": "masidy",
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[image/generate] Stability error:", res.status, err);
      return Response.json({ error: `Generation failed: ${err}` }, { status: 500 });
    }

    const data = await res.json() as { image?: string; finish_reason?: string; seed?: number };

    if (!data.image) {
      return Response.json({ error: "No image returned from generation service." }, { status: 500 });
    }

    // Deduct credits for paid quality
    if (userId && quality !== "standard") {
      deductUserCredits(userId, CREDIT_COST[quality]).catch(() => {});
    }

    // Return as data URL — Stability returns base64 encoded image
    const imageUrl = `data:image/jpeg;base64,${data.image}`;
    return Response.json({ url: imageUrl, quality });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[image/generate] error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
