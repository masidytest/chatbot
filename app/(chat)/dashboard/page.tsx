"use client";

import {
  BrainIcon,
  FileTextIcon,
  MessageSquareIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
  ZapIcon,
  LogOutIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";
import { Button } from "@/components/ui/button";
import { guestRegex } from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type MemoryFact = { key: string; value: string };
type ChatHistory = { chats: { id: string; title: string; createdAt: string }[]; hasMore: boolean };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const [chatCount, setChatCount] = useState<number | null>(null);
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [documents, setDocuments] = useState<{ id: string; title: string; kind: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "memory" | "documents" | "settings">("overview");

  const isGuest = guestRegex.test(session?.user?.email ?? "");
  const userEmail = session?.user?.email ?? "";
  const userName = userEmail.split("@")[0] ?? "User";

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setChatCount(data.chatCount ?? 0);
        setMemories(data.memories ?? []);
        setDocuments(data.documents ?? []);
      })
      .catch(() => {
        setChatCount(0);
        setMemories([]);
        setDocuments([]);
      });
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <MasidyAnimatedIcon size={40} animate={true} />
      </div>
    );
  }

  function emailToHue(email: string): number {
    let hash = 0;
    for (const char of email) hash = char.charCodeAt(0) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
  }

  const hue = emailToHue(userEmail);

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "memory", label: "Memory", icon: BrainIcon },
    { id: "documents", label: "Documents", icon: FileTextIcon },
    { id: "settings", label: "Settings", icon: ZapIcon },
  ] as const;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              href="/"
            >
              <ArrowLeftIcon className="size-3.5" />
              Back to chat
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MasidyAnimatedIcon size={24} animate={false} />
            <span className="font-bold text-foreground">MASIDY</span>
          </div>
          <Button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            size="icon-sm"
            variant="ghost"
          >
            {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Profile card */}
        <div className="mb-8 flex items-center gap-5 rounded-2xl border border-border/40 bg-card/50 p-6">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, oklch(0.45 0.15 ${hue}), oklch(0.35 0.1 ${hue + 40}))`,
            }}
          >
            {isGuest ? "G" : userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-foreground">
              {isGuest ? "Guest User" : userName}
            </div>
            <div className="text-sm text-muted-foreground">{isGuest ? "Not signed in" : userEmail}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-500">
                {isGuest ? "Guest" : "Member"}
              </span>
            </div>
          </div>
          {isGuest ? (
            <Button onClick={() => router.push("/login")} size="sm">
              Sign in
            </Button>
          ) : (
            <Button
              onClick={() => signOut({ redirectTo: "/" })}
              size="sm"
              variant="outline"
            >
              <LogOutIcon className="size-3.5 mr-1.5" />
              Sign out
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{chatCount ?? "—"}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <MessageSquareIcon className="size-3.5" />
              Chats
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{memories.length}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <BrainIcon className="size-3.5" />
              Memories
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{documents.length}</div>
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
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
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
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
            <div className="rounded-xl border border-border/40 bg-card/50 p-6 text-center text-sm text-muted-foreground">
              {chatCount === 0
                ? "No chats yet. Start a conversation!"
                : `You have ${chatCount} chat${chatCount === 1 ? "" : "s"}. Keep exploring!`}
            </div>
            <div className="rounded-xl border border-border/40 bg-card/50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button className="justify-start gap-2" onClick={() => router.push("/")} variant="outline">
                  <MessageSquareIcon className="size-4" />
                  New Chat
                </Button>
                <Button className="justify-start gap-2" onClick={() => setActiveTab("memory")} variant="outline">
                  <BrainIcon className="size-4" />
                  View Memory
                </Button>
                <Button className="justify-start gap-2" onClick={() => setActiveTab("documents")} variant="outline">
                  <FileTextIcon className="size-4" />
                  My Documents
                </Button>
                <Button className="justify-start gap-2" onClick={() => setActiveTab("settings")} variant="outline">
                  <ZapIcon className="size-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "memory" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              What Masidy remembers about you
            </h2>
            {memories.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
                <BrainIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No memories yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Tell Masidy your name, location, or preferences and it will remember them.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((mem) => (
                  <div
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-card/50 px-4 py-3"
                    key={mem.key}
                  >
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                        {mem.key}
                      </div>
                      <div className="text-sm text-foreground">{mem.value}</div>
                    </div>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] text-orange-500">
                      remembered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Uploaded Documents
            </h2>
            {documents.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
                <FileTextIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No documents yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Upload PDF, TXT, or MD files in chat using the paperclip button.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 px-4 py-3"
                    key={doc.id}
                  >
                    <FileTextIcon className="size-4 shrink-0 text-muted-foreground/60" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm text-foreground">{doc.title}</div>
                      <div className="text-[11px] text-muted-foreground/60">{doc.kind}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</h2>

            <div className="rounded-xl border border-border/40 bg-card/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Theme</div>
                  <div className="text-xs text-muted-foreground">Switch between light and dark mode</div>
                </div>
                <Button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  size="sm"
                  variant="outline"
                >
                  {resolvedTheme === "dark" ? (
                    <><SunIcon className="size-3.5 mr-1.5" />Light mode</>
                  ) : (
                    <><MoonIcon className="size-3.5 mr-1.5" />Dark mode</>
                  )}
                </Button>
              </div>

              <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Delete all chats</div>
                  <div className="text-xs text-muted-foreground">Permanently remove all your conversations</div>
                </div>
                <Button
                  onClick={() => {
                    if (confirm("Delete all chats? This cannot be undone.")) {
                      fetch("/api/history", { method: "DELETE" }).then(() => {
                        setChatCount(0);
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

              {!isGuest && (
                <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Sign out</div>
                    <div className="text-xs text-muted-foreground">Sign out of your Masidy account</div>
                  </div>
                  <Button
                    onClick={() => signOut({ redirectTo: "/" })}
                    size="sm"
                    variant="outline"
                  >
                    <LogOutIcon className="size-3.5 mr-1.5" />
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
