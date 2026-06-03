import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import Stripe from "stripe";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://masidy.com";

// Hardcoded price IDs — env vars override these
const PRICE_PLUS = "price_1TecNWD31DwzbfMdkh4faZmb";
const PRICE_PRO  = "price_1Tc3N8D31DwzbfMdFpndopvQ";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return Response.json({ error: "Payment system not configured. Contact support." }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

  let body: { type?: string; plan?: string; package?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (body.type === "subscription") {
      const isPlus = body.plan === "plus";
      const isPro  = body.plan === "pro";

      if (!isPlus && !isPro) {
        return Response.json({ error: `Unknown plan: ${body.plan}` }, { status: 400 });
      }

      const priceId = isPro
        ? (process.env.STRIPE_PRICE_PRO?.trim() ?? PRICE_PRO)
        : (process.env.STRIPE_PRICE_PLUS?.trim() ?? PRICE_PLUS);

      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          userId: session.user.id,
          type: "subscription",
          plan: body.plan ?? "plus",
        },
        client_reference_id: session.user.id,
        success_url: `${BASE_URL}/?billing=success&plan=${body.plan}`,
        cancel_url: `${BASE_URL}/pricing`,
      });

      return Response.json({ url: checkout.url });

    } else if (body.type === "topup") {
      const packages: Record<string, { credits: number; price: number; label: string }> = {
        topup_500:  { credits: 500,  price: 500,  label: "500 Credits — $5"  },
        topup_1200: { credits: 1200, price: 1000, label: "1200 Credits — $10" },
        topup_3500: { credits: 3500, price: 2500, label: "3500 Credits — $25" },
      };

      const pkg = packages[body.package ?? "topup_500"];
      if (!pkg) {
        return Response.json({ error: "Invalid package" }, { status: 400 });
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: pkg.price,
              product_data: {
                name: `Masidy Credits — ${pkg.label}`,
                description: `${pkg.credits} credits added instantly. Credits never expire.`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: session.user.id,
          type: "topup",
          credits: String(pkg.credits),
        },
        client_reference_id: session.user.id,
        success_url: `${BASE_URL}/?billing=success&credits=${pkg.credits}`,
        cancel_url: `${BASE_URL}/pricing`,
      });

      return Response.json({ url: checkout.url });

    } else {
      return Response.json({ error: `Unknown type: ${body.type}` }, { status: 400 });
    }

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[billing/checkout] plan=${body.plan} error:`, msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
