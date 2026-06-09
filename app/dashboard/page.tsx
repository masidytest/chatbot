"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CoinsIcon,
  LogOutIcon,
  MessageSquareIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  TrashIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

type BillingStatus = {
  plan: "free" | "plus" | "pro";
  planName: string;
  credits: number;
  monthlyCredits: number;
};

type DashboardData = {
  chatCount: number;
  memories: { key: string; value: string }[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "memory">("overview");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const userEmail = session?.user?.email ?? "";
  const userName = userEmail.split("@")[0] ?? "User";

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/billing/status").then((r) => r.json()).catch(() => null),
      fetch("/api/dashboard").then((r) => r.json()).catch(() => null),
    ]).then(([b, d]) => {
      if (b && b.plan && !b.error && !b.code) {
        setBilling(b as BillingStatus);
      } else {
        setBilling({ plan: "free", planName: "Free", credits: 0, monthlyCredits: 0 });
      }
      if (d && !d.error) setData(d as DashboardData);
    });
  }, [status]);

  async function goToCheckout(type: "subscription" | "topup", body: Record<string, string>, id: string) {
    setCheckoutLoading(id);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...body }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setCheckoutError(json.error ?? "Checkout failed. Please try again.");
      }
    } catch {
      setCheckoutError("Network error. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <MasidyAnimatedIcon animate size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  function emailToHue(email: string) {
    let hash = 0;
    for (const c of email) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
  }
  const hue = emailToHue(userEmail);

  const tabs = [
    { id: "overview", label: "Overview", icon: MessageSquareIcon },
    { id: "memory",   label: "Memory",   icon: BrainIcon },
  ] as const;

  return (
    <div className="min-h-dvh bg-background">

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-sidebar/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link className="flex items-center gap-1.5 text-[13px] text-muted-foreground" href="/">
            <ArrowLeftIcon className="size-4" />
            <span className="hidden sm:inline">{t("dashboard.back", "Back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <MasidyAnimatedIcon animate={false} size={20} />
            <span className="text-sm font-bold text-foreground">{t("common.masidy", "MASIDY")}</span>
          </div>
          <Button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} size="icon" variant="ghost" className="size-8">
            {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">

        {/* Profile card */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ background: `linear-gradient(135deg, oklch(0.45 0.15 ${hue}), oklch(0.35 0.1 ${hue + 40}))` }}
            >
              {userName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{userName}</div>
              <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
            </div>
            <Button
              onClick={() => signOut({ redirectTo: "/" })}
              size="sm"
              variant="outline"
              className="shrink-0 text-xs"
            >
              <LogOutIcon className="size-3.5" />
              <span className="ml-1.5 hidden sm:inline">{t("dashboard.signOut", "Sign out")}</span>
            </Button>
          </div>
        </div>

        {/* Error */}
        {checkoutError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-500">
            {checkoutError}
          </div>
        )}

        {/* Plan & Credits */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t("dashboard.planCredits", "Plan & Credits")}</h2>
            <Link href="/pricing" className="text-[12px] text-orange-500">{t("dashboard.viewPlans", "View plans →")}</Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <div className={cn("mb-1 text-[11px] font-semibold uppercase tracking-wider",
                billing?.plan === "pro" ? "text-orange-500" :
                billing?.plan === "plus" ? "text-blue-500" : "text-muted-foreground"
              )}>
                {billing?.planName ?? "—"}
              </div>
              <div className="text-xl font-bold text-foreground">
                {billing?.plan === "free" ? t("dashboard.free", "Free") : billing?.plan === "plus" ? "$5/mo" : "$10/mo"}
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <CoinsIcon className="size-3" />
                {t("dashboard.credits", "Credits")}
              </div>
              <div className="text-xl font-bold text-foreground">{billing?.credits ?? "—"}</div>
              {billing?.plan !== "free" && (
                <div className="text-[10px] text-muted-foreground">+{billing?.monthlyCredits}{t("dashboard.perMonth", "/month")}</div>
              )}
            </div>
          </div>

          {/* Upgrade buttons — full width stacked on mobile */}
          {billing?.plan === "free" && (
            <div className="space-y-2">
              <Button
                className="w-full justify-center"
                disabled={checkoutLoading === "plus"}
                onClick={() => goToCheckout("subscription", { plan: "plus" }, "plus")}
                variant="outline"
              >
                <ZapIcon className="mr-2 size-4 text-blue-500" />
                {checkoutLoading === "plus" ? t("common.loading", "Loading...") : t("dashboard.getPlus", "Get Plus — $5/month")}
              </Button>
              <Button
                className="w-full justify-center bg-orange-500 hover:bg-orange-600 border-0 text-white"
                disabled={checkoutLoading === "pro"}
                onClick={() => goToCheckout("subscription", { plan: "pro" }, "pro")}
              >
                <SparklesIcon className="mr-2 size-4" />
                {checkoutLoading === "pro" ? t("common.loading", "Loading...") : t("dashboard.getPro", "Get Pro — $10/month")}
              </Button>
            </div>
          )}

          {billing?.plan !== "free" && (
            <div className="space-y-3">
              <p className="text-[12px] text-muted-foreground text-center">{t("dashboard.topupCredits", "Top up credits — never expire")}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "topup_500",  label: "$5",  credits: 500,  note: "" },
                  { id: "topup_1200", label: "$10", credits: 1200, note: t("dashboard.bestValue", "Best value") },
                  { id: "topup_3500", label: "$25", credits: 3500, note: t("dashboard.bonus", "bonus") + " +500" },
                ].map((pkg) => (
                  <button
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card/50 py-3 text-center transition-all hover:border-orange-500/40",
                      checkoutLoading === pkg.id && "pointer-events-none opacity-50"
                    )}
                    key={pkg.id}
                    onClick={() => goToCheckout("topup", { package: pkg.id }, pkg.id)}
                    type="button"
                  >
                    {pkg.note && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-1.5 py-px text-[9px] font-bold text-white">
                        {pkg.note}
                      </span>
                    )}
                    <span className="text-sm font-bold text-foreground">{pkg.label}</span>
                    <span className="text-[11px] text-muted-foreground">{pkg.credits} cr</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{data?.chatCount ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <MessageSquareIcon className="size-3.5" />
              {t("dashboard.chats", "Chats")}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{data?.memories.length ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <BrainIcon className="size-3.5" />
              {t("dashboard.memories", "Memories")}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
          {tabs.map((tab) => (
            <button
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <tab.icon className="size-4" />
              {tab.label === "Overview" ? t("dashboard.overview", "Overview") : t("dashboard.memory", "Memory")}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/40 bg-card/50 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t("dashboard.quickActions", "Quick Actions")}</h3>
              <Button className="w-full justify-center gap-2" onClick={() => router.push("/")} variant="outline">
                <MessageSquareIcon className="size-4" />
                {t("chat.newChat", "New Chat")}
              </Button>
              <Button className="w-full justify-center gap-2" onClick={() => router.push("/pricing")} variant="outline">
                <SparklesIcon className="size-4" />
                {t("dashboard.upgradePlan", "Upgrade plan")}
              </Button>
              <Button className="w-full justify-center gap-2" onClick={() => setActiveTab("memory")} variant="outline">
                <BrainIcon className="size-4" />
                {t("dashboard.viewMemory", "View Memory")}
              </Button>
            </div>

            <div className="rounded-xl border border-border/40 bg-card/50 p-5">
              <div className="mb-1 text-sm font-medium text-foreground">{t("dashboard.deleteAllChats", "Delete all chats")}</div>
              <div className="mb-3 text-xs text-muted-foreground">{t("dashboard.permanentlyRemove", "Permanently remove all conversations")}</div>
              <Button
                className="w-full justify-center"
                onClick={() => {
                  if (confirm(t("dashboard.deleteConfirm", "Delete all chats? This cannot be undone."))) {
                    fetch("/api/history", { method: "DELETE" }).then(() => {
                      setData((d) => d ? { ...d, chatCount: 0 } : d);
                      router.push("/");
                    });
                  }
                }}
                variant="destructive"
              >
                <TrashIcon className="mr-2 size-4" />
                {t("dashboard.deleteAllChatsBtn", "Delete all chats")}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "memory" && (
          <div className="space-y-2">
            {!data?.memories.length ? (
              <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
                <BrainIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("dashboard.noMemoriesYet", "No memories yet.")}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {t("dashboard.tellMasidy", "Tell Masidy your name or preferences and it will remember them.")}
                </p>
              </div>
            ) : (
              data.memories.map((mem) => (
                <div className="rounded-xl border border-border/40 bg-card/50 px-4 py-3" key={mem.key}>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-0.5">{mem.key}</div>
                  <div className="text-sm text-foreground">{mem.value}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom padding for mobile */}
        <div className="h-6" />
      </div>
    </div>
  );
}
