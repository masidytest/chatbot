"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CoinsIcon,
  FileTextIcon,
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

type BillingStatus = {
  plan: "free" | "plus" | "pro";
  planName: string;
  credits: number;
  monthlyCredits: number;
};

type DashboardData = {
  chatCount: number;
  memories: { key: string; value: string }[];
  documents: { id: string; title: string; kind: string }[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "memory" | "documents">("overview");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const userEmail = session?.user?.email ?? "";
  const userName = userEmail.split("@")[0] ?? "User";

  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/billing/status").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(([b, d]) => {
      setBilling(b as BillingStatus);
      setData(d as DashboardData);
    }).catch(() => {});
  }, [status]);

  async function goToCheckout(type: "subscription" | "topup", body: Record<string, string>, id: string) {
    setCheckoutLoading(id);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...body }),
      });
      const json = await res.json() as { url?: string };
      if (json.url) window.location.href = json.url;
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
    { id: "documents",label: "Documents",icon: FileTextIcon },
  ] as const;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
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
          <Button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            size="icon"
            variant="ghost"
            className="size-8"
          >
            {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* Profile card */}
        <div className="mb-6 flex items-center gap-5 rounded-2xl border border-border/40 bg-card/50 p-6">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, oklch(0.45 0.15 ${hue}), oklch(0.35 0.1 ${hue + 40}))` }}
          >
            {userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-foreground">{userName}</div>
            <div className="text-sm text-muted-foreground truncate">{userEmail}</div>
          </div>
          <Button
            onClick={() => signOut({ redirectTo: "/" })}
            size="sm"
            variant="outline"
            className="shrink-0"
          >
            <LogOutIcon className="size-3.5 mr-1.5" />
            Sign out
          </Button>
        </div>

        {/* Plan + credits card */}
        <div className="mb-6 rounded-2xl border border-border/40 bg-card/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Plan & Credits</h2>
            <Link
              href="/pricing"
              className="text-[12px] text-orange-500 hover:text-orange-400 transition-colors"
            >
              View all plans →
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 rounded-xl bg-muted/40 p-4 text-center">
              <div className={cn(
                "mb-1 text-xs font-semibold uppercase tracking-wider",
                billing?.plan === "pro" ? "text-orange-500" :
                billing?.plan === "plus" ? "text-blue-500" : "text-muted-foreground"
              )}>
                {billing?.planName ?? "—"}
              </div>
              <div className="text-2xl font-bold text-foreground">{billing?.plan === "free" ? "Free" : billing?.plan === "plus" ? "$5/mo" : "$10/mo"}</div>
            </div>
            <div className="flex-1 rounded-xl bg-muted/40 p-4 text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CoinsIcon className="size-3" />
                Credits
              </div>
              <div className="text-2xl font-bold text-foreground">{billing?.credits ?? "—"}</div>
              {billing?.plan !== "free" && (
                <div className="text-[11px] text-muted-foreground">+{billing?.monthlyCredits}/mo</div>
              )}
            </div>
          </div>

          {/* Upgrade or top-up */}
          {billing?.plan === "free" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="w-full"
                disabled={checkoutLoading === "plus"}
                onClick={() => goToCheckout("subscription", { plan: "plus" }, "plus")}
                type="button"
                variant="outline"
              >
                <ZapIcon className="mr-1.5 size-3.5 text-blue-500" />
                {checkoutLoading === "plus" ? "Loading..." : "Get Plus — $5/mo"}
              </Button>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 border-0 text-white"
                disabled={checkoutLoading === "pro"}
                onClick={() => goToCheckout("subscription", { plan: "pro" }, "pro")}
                type="button"
              >
                <SparklesIcon className="mr-1.5 size-3.5" />
                {checkoutLoading === "pro" ? "Loading..." : "Get Pro — $10/mo"}
              </Button>
            </div>
          )}

          {billing?.plan !== "free" && (
            <div>
              <p className="mb-3 text-[12px] text-muted-foreground">Top up credits any time — never expire</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "topup_500",  label: "$5",  credits: 500,  note: "" },
                  { id: "topup_1200", label: "$10", credits: 1200, note: "Best value" },
                  { id: "topup_3500", label: "$25", credits: 3500, note: "+500 bonus" },
                ].map((pkg) => (
                  <button
                    className={cn(
                      "relative flex flex-col items-center rounded-xl border border-border/40 bg-card/50 py-3 text-center transition-all hover:border-orange-500/40 hover:bg-orange-500/5",
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
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{data?.chatCount ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <MessageSquareIcon className="size-3.5" />
              Chats
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{data?.memories.length ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <BrainIcon className="size-3.5" />
              Memories
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{data?.documents.length ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <FileTextIcon className="size-3.5" />
              Documents
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
          {tabs.map((tab) => (
            <button
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/40 bg-card/50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button className="justify-start gap-2" onClick={() => router.push("/")} variant="outline">
                  <MessageSquareIcon className="size-4" />
                  New Chat
                </Button>
                <Button className="justify-start gap-2" onClick={() => router.push("/pricing")} variant="outline">
                  <SparklesIcon className="size-4" />
                  Upgrade Plan
                </Button>
                <Button className="justify-start gap-2" onClick={() => setActiveTab("memory")} variant="outline">
                  <BrainIcon className="size-4" />
                  View Memory
                </Button>
                <Button className="justify-start gap-2" onClick={() => setActiveTab("documents")} variant="outline">
                  <FileTextIcon className="size-4" />
                  Documents
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Delete all chats</div>
                  <div className="text-xs text-muted-foreground">Permanently remove all conversations</div>
                </div>
                <Button
                  onClick={() => {
                    if (confirm("Delete all chats? This cannot be undone.")) {
                      fetch("/api/history", { method: "DELETE" }).then(() => {
                        setData((d) => d ? { ...d, chatCount: 0 } : d);
                        router.push("/");
                      });
                    }
                  }}
                  size="sm"
                  variant="destructive"
                >
                  <TrashIcon className="size-3.5 mr-1.5" />
                  Delete all
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "memory" && (
          <div className="space-y-2">
            {!data?.memories.length ? (
              <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
                <BrainIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No memories yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Tell Masidy your name or preferences and it will remember them.
                </p>
              </div>
            ) : (
              data.memories.map((mem) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-card/50 px-4 py-3"
                  key={mem.key}
                >
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">{mem.key}</div>
                    <div className="text-sm text-foreground">{mem.value}</div>
                  </div>
                  <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] text-orange-500">remembered</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2">
            {!data?.documents.length ? (
              <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
                <FileTextIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No documents yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Upload PDF, TXT, or MD files in chat using the paperclip button.
                </p>
              </div>
            ) : (
              data.documents.map((doc) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 px-4 py-3"
                  key={doc.id}
                >
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground/60" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-foreground">{doc.title}</div>
                    <div className="text-[11px] text-muted-foreground/60">{doc.kind}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
