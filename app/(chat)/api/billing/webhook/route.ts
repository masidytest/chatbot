import { headers } from "next/headers";
import Stripe from "stripe";
import { addUserCredits } from "@/lib/db/credits-queries";
import { setUserPlan } from "@/lib/db/plan-queries";
import { creditsByPlan } from "@/lib/ai/tiers";
import type { UserPlan } from "@/lib/ai/tiers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    console.error("Webhook signature failed:", e);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      // ── One-time payment completed (top-up) ────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ?? session.client_reference_id;
        if (!userId) break;

        if (session.metadata?.type === "topup" && session.payment_status === "paid") {
          const credits = Number(session.metadata.credits ?? "0");
          if (credits > 0) {
            await addUserCredits(userId, credits);
            console.log(`Top-up: +${credits} credits for user ${userId}`);
          }
        }

        if (session.metadata?.type === "subscription" && session.payment_status === "paid") {
          // subscription.created fires too — but handle here for first payment
          const plan = (session.metadata.plan ?? "plus") as UserPlan;
          await setUserPlan(userId, plan);
          await addUserCredits(userId, creditsByPlan[plan]);
          console.log(`New subscription: plan=${plan}, +${creditsByPlan[plan]} credits for user ${userId}`);
        }
        break;
      }

      // ── Subscription renewed (monthly) ─────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Only for subscription renewals (not first payment — handled above)
        if (invoice.billing_reason !== "subscription_cycle") break;

        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        // Determine plan from price ID
        const priceId = subscription.items.data[0]?.price?.id;
        let plan: UserPlan = "plus";
        if (priceId === process.env.STRIPE_PRICE_PRO) plan = "pro";

        // Add monthly credits
        await addUserCredits(userId, creditsByPlan[plan]);
        console.log(`Renewal: plan=${plan}, +${creditsByPlan[plan]} credits for user ${userId}`);
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        // Downgrade to free — they keep remaining credits
        await setUserPlan(userId, "free");
        console.log(`Subscription cancelled: downgraded user ${userId} to free`);
        break;
      }

      // ── Subscription upgraded/downgraded ───────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        if (subscription.status === "active") {
          const priceId = subscription.items.data[0]?.price?.id;
          let plan: UserPlan = "plus";
          if (priceId === process.env.STRIPE_PRICE_PRO) plan = "pro";
          await setUserPlan(userId, plan);
          console.log(`Plan updated: user ${userId} → ${plan}`);
        }
        break;
      }
    }
  } catch (e) {
    console.error("Webhook processing error:", e);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

// Stripe needs raw body — disable Next.js body parsing
export const config = { api: { bodyParser: false } };
