import { auth } from "@/app/(auth)/auth";

// Temporary debug endpoint — remove after fixing
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "not authenticated" }, { status: 401 });
  }

  return Response.json({
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPricePlus: !!process.env.STRIPE_PRICE_PLUS,
    hasPricePro: !!process.env.STRIPE_PRICE_PRO,
    pricePlus: process.env.STRIPE_PRICE_PLUS ?? "NOT SET",
    pricePro: process.env.STRIPE_PRICE_PRO ?? "NOT SET",
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.slice(0, 10) ?? "NOT SET",
  });
}
