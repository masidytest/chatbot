import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://masidy.com";

/**
 * POST /api/billing/checkout
 * Body: { type: "subscription", plan: "plus" | "pro" }
 *    OR { type: "topup", package: "topup_500" | "topup_1200" | "topup_3500" }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const body = await request.json() as {
    type: "subscription" | "topup";
    plan?: "plus" | "pro";
    package?: string;
  };

  try {
    if (body.type === "subscription") {
      // ── Monthly subscription ──────────────────────────────────────────────
      const priceId =
        body.plan === "pro"
          ? process.env.STRIPE_PRICE_PRO      // $10/month
          : process.env.STRIPE_PRICE_PLUS;    // $5/month

      if (!priceId) {
        return Response.json({ error: "Stripe price not configured" }, { status: 500 });
      }

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
        cancel_url: `${BASE_URL}/?billing=cancelled`,
      });

      return Response.json({ url: checkout.url });

    } else if (body.type === "topup") {
      // ── One-time top-up ───────────────────────────────────────────────────
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
              unit_amount: pkg.price, // in cents
              product_data: {
                name: `Masidy Credits — ${pkg.label}`,
                description: `${pkg.credits} credits added to your account instantly. Credits never expire.`,
                images: [`${BASE_URL}/masidy-icon.svg`],
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
        cancel_url: `${BASE_URL}/?billing=cancelled`,
      });

      return Response.json({ url: checkout.url });
    }

    return Response.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
