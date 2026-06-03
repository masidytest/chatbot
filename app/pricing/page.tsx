"use client";

import { CheckIcon, ZapIcon, SparklesIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function goToCheckout(
    type: "subscription" | "topup",
    body: Record<string, string>,
    id: string
  ) {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(id);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...body }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

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
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Simple, honest pricing
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-500">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* FREE */}
          <div className="flex flex-col rounded-2xl border-2 border-border/40 bg-card/50 p-6">
            <div className="mb-6">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Free</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="mb-1 text-sm text-muted-foreground">/forever</span>
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">Start chatting instantly. No card needed.</p>
            </div>
            <ul className="mb-8 flex-1 space-y-2.5">
              {[
                "Masidy AI — unlimited messages",
                "Web search (live results)",
                "Image generation",
                "Weather, stocks, news",
                "YouTube & webpage summarizer",
                "QR codes & dictionary",
                "Document upload (TXT, MD)",
                "Memory across conversations",
                "Multilingual support",
                "Voice input (Chrome/Edge)",
              ].map((f) => (
                <li className="flex items-start gap-2.5 text-[13px] text-foreground" key={f}>
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" variant="outline">
              <Link href="/">Start for free</Link>
            </Button>
          </div>

          {/* PLUS */}
          <div className="relative flex flex-col rounded-2xl border-2 border-blue-500/40 bg-card/50 p-6 md:scale-[1.02]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white">
              Most popular
            </div>
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <ZapIcon className="size-4 text-blue-500" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Plus</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">$5</span>
                <span className="mb-1 text-sm text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">More powerful models for everyday use.</p>
            </div>
            <ul className="mb-8 flex-1 space-y-2.5">
              {[
                "Everything in Free",
                "Masidy Code — coding, debugging, 164K context",
                "Masidy Mini — fast reasoning + tool use, 131K context",
                "Masidy Max — strongest reasoning, complex research",
                "Masidy Speed — reads images, 1M context, fastest",
                "500 credits/month included",
                "Buy more credits any time",
              ].map((f) => (
                <li className="flex items-start gap-2.5 text-[13px] text-foreground" key={f}>
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              disabled={loading === "plus"}
              onClick={() => goToCheckout("subscription", { plan: "plus" }, "plus")}
              type="button"
            >
              {loading === "plus" ? "Redirecting..." : "Upgrade to Plus"}
            </Button>
          </div>

          {/* PRO */}
          <div className="relative flex flex-col rounded-2xl border-2 border-orange-500/40 bg-card/50 p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white">
              Most powerful
            </div>
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <SparklesIcon className="size-4 text-orange-500" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pro</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">$10</span>
                <span className="mb-1 text-sm text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">The full Masidy suite.</p>
            </div>
            <ul className="mb-8 flex-1 space-y-2.5">
              {[
                "Everything in Plus",
                "Masidy Flash — reads images, 262K context, vision + code",
                "1200 credits/month included",
                "Buy more credits any time",
                "Priority support",
              ].map((f) => (
                <li className="flex items-start gap-2.5 text-[13px] text-foreground" key={f}>
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 border-0 text-white"
              disabled={loading === "pro"}
              onClick={() => goToCheckout("subscription", { plan: "pro" }, "pro")}
              type="button"
            >
              {loading === "pro" ? "Redirecting..." : "Upgrade to Pro"}
            </Button>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-16 rounded-2xl border border-border/40 bg-card/30 p-8">
          <h2 className="mb-2 text-xl font-bold text-foreground">How credits work</h2>
          <p className="mb-6 text-[14px] text-muted-foreground">
            Credits are used when you message with paid models. The free Masidy model never uses credits. Credits never expire.
          </p>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { model: "Masidy", cost: "0 credits", note: "Always free" },
              { model: "Code / Mini / Speed / Max", cost: "1 credit", note: "per message" },
              { model: "Flash", cost: "3 credits", note: "per message" },
              { model: "1 credit", cost: "= $0.01", note: "" },
            ].map((row) => (
              <div className="rounded-xl border border-border/40 bg-card/50 p-3 text-center" key={row.model}>
                <div className="text-[12px] font-medium text-foreground">{row.model}</div>
                <div className="mt-1 text-lg font-bold text-orange-500">{row.cost}</div>
                {row.note && <div className="text-[11px] text-muted-foreground">{row.note}</div>}
              </div>
            ))}
          </div>

          <h3 className="mb-3 text-base font-semibold text-foreground">Top up any time</h3>
          <p className="mb-4 text-[13px] text-muted-foreground">
            Run out mid-month? Buy more instantly.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "topup_500",  label: "$5",  credits: 500,  note: "" },
              { id: "topup_1200", label: "$10", credits: 1200, note: "Best value" },
              { id: "topup_3500", label: "$25", credits: 3500, note: "+500 bonus" },
            ].map((pkg) => (
              <button
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 border-border/40 bg-card/50 py-4 text-center transition-all hover:border-orange-500/50 hover:bg-orange-500/5",
                  loading === pkg.id && "pointer-events-none opacity-50"
                )}
                key={pkg.id}
                onClick={() => goToCheckout("topup", { package: pkg.id }, pkg.id)}
                type="button"
              >
                {pkg.note && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-2 py-px text-[10px] font-bold text-white">
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
          <h2 className="mb-6 text-xl font-bold text-foreground">Questions</h2>
          {[
            { q: "Can I cancel any time?", a: "Yes. Cancel from your dashboard and you keep access until the period ends. Your remaining credits never expire." },
            { q: "Do credits expire?", a: "No. Monthly credits roll over. Top-up credits stay until you use them." },
            { q: "What happens when I run out of credits?", a: "The free Masidy model always works with no credits. For paid models, buy a top-up and continue instantly." },
            { q: "Can I upgrade or downgrade?", a: "Yes, any time. Upgrading is immediate. Downgrading takes effect at the next billing cycle." },
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
