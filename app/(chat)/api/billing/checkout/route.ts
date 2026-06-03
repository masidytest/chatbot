import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import Stripe from "stripe";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://masidy.com";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

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
    const stripe = getStripe();

    if (body.type === "subscription") {
      // Use env var, fall back to known price IDs
      const priceId =
        body.plan === "pro"
          ? (process.env.STRIPE_PRICE_PRO ?? "price_1Tc3N8D31DwzbfMdFpndopvQ")
          : (process.env.STRIPE_PRICE_PLUS ?? "price_1TecNWD31DwzbfMdkh4faZmb");

      console.log(`[billing] plan=${body.plan} priceId=${priceId}`);


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
        cancel_url: `${BASE_URL}/?billing=cancelled`,
      });

      return Response.json({ url: checkout.url });
    }

    return Response.json({ error: "Invalid type" }, { status: 400 });

  } catch (e) {
    console.error("Stripe checkout error:", e);
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }
}
