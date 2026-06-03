"use client";

import { CheckIcon, ZapIcon, SparklesIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start chatting instantly. No card needed.",
    color: "border-border/40",
    badge: null,
    buttonLabel: "Start for free",
    buttonVariant: "outline" as const,
    href: "/",
    features: [
      "Masidy AI — web search, images, weather, stocks",
      "YouTube summarizer",
      "QR codes & dictionary",
      "Memory across conversations",
      "Voice input & output",
      "File uploads & document analysis",
      "Unlimited messages on Masidy model",
    ],
    locked: [],
  },
  {
    id: "plus",
    name: "Plus",
    price: "$5",
    period: "per month",
    description: "More powerful models for everyday use.",
    color: "border-blue-500/40",
    badge: "Most popular",
    badgeColor: "bg-blue-500",
    buttonLabel: "Upgrade to Plus",
    buttonVariant: "default" as const,
    plan: "plus",
    features: [
      "Everything in Free",
      "Masidy Code — best for coding & debugging",
      "Masidy Mini — fast everyday reasoning",
      "Masidy Pro — deep reasoning & analysis",
      "Masidy Speed — instant responses",
      "500 credits/month included",
      "Buy more credits any time",
    ],
    locked: [],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$10",
    period: "per month",
    description: "The full Masidy suite. Most capable models.",
    color: "border-orange-500/40",
    badge: "Most powerful",
    badgeColor: "bg-orange-500",
    buttonLabel: "Upgrade to Pro",
    buttonVariant: "default" as const,
    plan: "pro",
    features: [
      "Everything in Plus",
      "Masidy Flash — most powerful model (vision + long context)",
      "1200 credits/month included",
      "Buy more credits any time",
      "Priority support",
    ],
    locked: [],
  },
];

const TOP_UPS = [
  { id: "topup_500",  label: "$5",  credits: 500,  note: "" },
  { id: "topup_1200", label: "$10", credits: 1200, note: "Best value" },
  { id: "topup_3500", label: "$25", credits: 3500, note: "+500 bonus" },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (type: "subscription" | "topup", payload: object, id: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(id);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            href="/"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to chat
          </Link>
          <div className="flex items-center gap-2">
            <MasidyAnimatedIcon animate={false} size={22} />
            <span className="font-bold text-foreground">MASIDY</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Simple, honest pricing
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              className={cn(
                "relative flex flex-col rounded-2xl border-2 bg-card/50 p-6",
                plan.color,
                plan.id === "plus" && "md:scale-[1.02]"
              )}
              key={plan.id}
            >
              {plan.badge && (
                <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold text-white", plan.badgeColor)}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === "plus" && <ZapIcon className="size-4 text-blue-500" />}
                  {plan.id === "pro" && <SparklesIcon className="size-4 text-orange-500" />}
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {plan.name}
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li className="flex items-start gap-2.5 text-[13px] text-foreground" key={f}>
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/">{plan.buttonLabel}</Link>
                </Button>
              ) : (
                <Button
                  className={cn(
                    "w-full",
                    plan.id === "pro" && "bg-orange-500 hover:bg-orange-600 text-white border-0"
                  )}
                  disabled={loading === plan.id}
                  onClick={() => checkout("subscription", { plan: plan.plan }, plan.id)}
                  variant={plan.id === "plus" ? "default" : "default"}
                >
                  {loading === plan.id ? "Loading..." : plan.buttonLabel}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Credits explanation */}
        <div className="mt-16 rounded-2xl border border-border/40 bg-card/30 p-8">
          <h2 className="mb-2 text-xl font-bold text-foreground">How credits work</h2>
          <p className="mb-6 text-[14px] text-muted-foreground">
            Credits are used for paid models. Free model (Masidy) never uses credits.
            Credits never expire and roll over every month.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
            {[
              { model: "Masidy", cost: "0 credits", note: "Always free" },
              { model: "Code / Mini / Speed / Pro", cost: "1 credit", note: "per message" },
              { model: "Flash", cost: "3 credits", note: "per message" },
              { model: "1 credit", cost: "= $0.01", note: "value" },
            ].map((row) => (
              <div className="rounded-xl border border-border/40 bg-card/50 p-3 text-center" key={row.model}>
                <div className="text-[12px] font-medium text-foreground">{row.model}</div>
                <div className="mt-1 text-lg font-bold text-orange-500">{row.cost}</div>
                <div className="text-[11px] text-muted-foreground">{row.note}</div>
              </div>
            ))}
          </div>

          {/* Top-up section */}
          <h3 className="mb-3 text-base font-semibold text-foreground">Top up credits any time</h3>
          <p className="mb-4 text-[13px] text-muted-foreground">
            Run out before the month ends? Buy more instantly — no waiting.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TOP_UPS.map((pkg) => (
              <button
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 border-border/40 bg-card/50 py-4 text-center transition-all hover:border-orange-500/50 hover:bg-orange-500/5",
                  loading === pkg.id && "opacity-50 pointer-events-none"
                )}
                key={pkg.id}
                onClick={() => checkout("topup", { package: pkg.id }, pkg.id)}
                type="button"
              >
                {pkg.note && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-2 py-px text-[10px] font-bold text-white whitespace-nowrap">
                    {pkg.note}
                  </span>
                )}
                <span className="text-2xl font-bold text-foreground">{pkg.label}</span>
                <span className="text-[13px] text-muted-foreground">{pkg.credits} credits</span>
                <span className="mt-1 text-[11px] text-muted-foreground/60">one-time</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Questions</h2>
          {[
            {
              q: "Can I cancel any time?",
              a: "Yes. Cancel from your account and you keep access until the end of the billing period. Your remaining credits stay on your account forever.",
            },
            {
              q: "Do credits expire?",
              a: "No. Credits never expire. Monthly credits roll over, and top-up credits stay until you use them.",
            },
            {
              q: "What happens when I run out of credits?",
              a: "You can still use Masidy (the free model) for free. For paid models, just buy a top-up and continue instantly.",
            },
            {
              q: "Can I upgrade or downgrade my plan?",
              a: "Yes, any time. Upgrading takes effect immediately. Downgrading takes effect at the next billing cycle.",
            },
          ].map(({ q, a }) => (
            <div className="rounded-xl border border-border/40 bg-card/30 p-5" key={q}>
              <div className="mb-1.5 text-[14px] font-semibold text-foreground">{q}</div>
              <div className="text-[13px] text-muted-foreground">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
