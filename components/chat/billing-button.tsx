"use client";

import { CoinsIcon, ZapIcon, SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BillingStatus = {
  plan: "free" | "plus" | "pro";
  planName: string;
  credits: number;
  monthlyCredits: number;
};

type TopUpPackage = {
  id: string;
  credits: number;
  price: number;
  label: string;
  bonus: string;
};

const TOP_UP_PACKAGES: TopUpPackage[] = [
  { id: "topup_500",  credits: 500,  price: 5,  label: "$5",  bonus: "" },
  { id: "topup_1200", credits: 1200, price: 10, label: "$10", bonus: "Best value" },
  { id: "topup_3500", credits: 3500, price: 25, label: "$25", bonus: "+500 bonus" },
];

export function BillingStatus() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const startCheckout = async (type: "subscription" | "topup", payload: object) => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  const isLow = status.credits < 50 && status.plan !== "free";

  return (
    <div className="px-2 py-2 space-y-3">
      {/* Plan + credits row */}
      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <CoinsIcon className="size-3.5 text-orange-500" />
          <span className="text-[12px] font-medium text-foreground">
            {status.credits} credits
          </span>
          {isLow && (
            <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500">
              Low
            </span>
          )}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            status.plan === "pro"
              ? "bg-orange-500/15 text-orange-500"
              : status.plan === "plus"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-muted text-muted-foreground"
          )}
        >
          {status.planName}
        </span>
      </div>

      {/* Top-up section — always available for paid plans */}
      {status.plan !== "free" && (
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] text-muted-foreground">Top up credits</p>
          <div className="grid grid-cols-3 gap-1.5">
            {TOP_UP_PACKAGES.map((pkg) => (
              <button
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border border-border/50 bg-card/50 py-2 text-center transition-colors hover:border-orange-500/40 hover:bg-orange-500/5",
                  loading && "opacity-50 pointer-events-none"
                )}
                key={pkg.id}
                onClick={() => startCheckout("topup", { package: pkg.id })}
                type="button"
              >
                {pkg.bonus && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-1.5 py-px text-[9px] font-bold text-white whitespace-nowrap">
                    {pkg.bonus}
                  </span>
                )}
                <span className="text-[13px] font-bold text-foreground">{pkg.label}</span>
                <span className="text-[10px] text-muted-foreground">{pkg.credits} cr</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade section for free users */}
      {status.plan === "free" && (
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] text-muted-foreground">Unlock more models</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/5 py-2.5 text-center transition-colors hover:border-blue-500/60",
                loading && "opacity-50 pointer-events-none"
              )}
              onClick={() => startCheckout("subscription", { plan: "plus" })}
              type="button"
            >
              <ZapIcon className="mb-0.5 size-3.5 text-blue-500" />
              <span className="text-[12px] font-bold text-foreground">Plus</span>
              <span className="text-[10px] text-muted-foreground">$5/mo</span>
            </button>
            <button
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/5 py-2.5 text-center transition-colors hover:border-orange-500/60",
                loading && "opacity-50 pointer-events-none"
              )}
              onClick={() => startCheckout("subscription", { plan: "pro" })}
              type="button"
            >
              <SparklesIcon className="mb-0.5 size-3.5 text-orange-500" />
              <span className="text-[12px] font-bold text-foreground">Pro</span>
              <span className="text-[10px] text-muted-foreground">$10/mo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
