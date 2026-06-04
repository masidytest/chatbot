import { auth } from "@/app/(auth)/auth";
import { getUserPlan } from "@/lib/db/plan-queries";
import { deductUserCredits, getUserCredits } from "@/lib/db/credits-queries";

const CREDIT_COST = { schnell: 3, dev: 10, pro: 20 } as const;

// Black Forest Labs FLUX endpoints
const BFL_ENDPOINTS: Record<string, string> = {
  schnell: "flux-dev",        // flux-dev is best quality at reasonable cost
  dev:     "flux-pro-1.1",    // High quality
  pro:     "flux-2-pro-preview", // Latest & best
};

const PLAN_MODEL: Record<string, keyof typeof BFL_ENDPOINTS> = {
  free: "schnell",
  plus: "dev",
  pro:  "pro",
};

const ASPECT_SIZES: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "16:9": { width: 1440, height: 810  },
  "9:16": { width: 810,  height: 1440 },
  "4:3":  { width: 1024, height: 768  },
  "3:4":  { width: 768,  height: 1024 },
};

export async function POST(request: Request) {
  const apiKey = process.env.FLUXAPI_API_KEY ?? process.env.BFL_API_KEY ?? process.env.FAL_KEY;
  if (!apiKey) {
    return Response.json({ error: "Image generation not configured." }, { status: 500 });
  }

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

  // Determine quality
  let quality: keyof typeof BFL_ENDPOINTS = "schnell";
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

  // Credit check
  if (userId && quality !== "schnell") {
    const cost = CREDIT_COST[quality as keyof typeof CREDIT_COST];
    const credits = await getUserCredits(userId);
    if (credits < cost) {
      return Response.json({ error: `Not enough credits (need ${cost}).` }, { status: 403 });
    }
  }

  const endpoint = BFL_ENDPOINTS[quality];
  const size = ASPECT_SIZES[body.aspectRatio ?? "1:1"] ?? ASPECT_SIZES["1:1"];

  try {
    // Step 1: Submit generation request
    const submitRes = await fetch(`https://api.bfl.ai/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "x-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: body.prompt,
        width: size.width,
        height: size.height,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return Response.json({ error: `BFL API error: ${submitRes.status} ${err}` }, { status: 500 });
    }

    const submitData = await submitRes.json() as { id: string; polling_url: string };
    const pollingUrl = submitData.polling_url;

    if (!pollingUrl) {
      return Response.json({ error: "No polling URL returned" }, { status: 500 });
    }

    // Step 2: Poll for result (max 60 seconds)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      const pollRes = await fetch(pollingUrl, {
        headers: { "accept": "application/json", "x-key": apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json() as {
        status: string;
        result?: { sample: string };
      };

      if (pollData.status === "Ready" && pollData.result?.sample) {
        // Deduct credits for paid quality
        if (userId && quality !== "schnell") {
          deductUserCredits(userId, CREDIT_COST[quality as keyof typeof CREDIT_COST]).catch(() => {});
        }
        return Response.json({ url: pollData.result.sample, quality });
      }

      if (pollData.status === "Error" || pollData.status === "Failed") {
        return Response.json({ error: "Generation failed. Please try again." }, { status: 500 });
      }
      // Still pending — keep polling
    }

    return Response.json({ error: "Generation timed out. Please try again." }, { status: 500 });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[image/generate] BFL error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
