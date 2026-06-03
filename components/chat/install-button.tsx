"use client";

import { DownloadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already installed — never show
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }
    // User dismissed before — don't show again this session
    if (sessionStorage.getItem("install-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsStandalone(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setIsStandalone(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("install-dismissed", "1");
    setDismissed(true);
  };

  if (isStandalone || dismissed || !prompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-border/40 bg-card/95 px-4 py-3 backdrop-blur-xl md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-[var(--shadow-float)] md:px-5 md:py-3.5 md:min-w-[320px]">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
          <DownloadIcon className="size-4 text-orange-500" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Get Masidy on your device</p>
          <p className="text-[11px] text-muted-foreground">Install for a faster experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg bg-orange-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-orange-600"
          onClick={handleInstall}
          type="button"
        >
          Install
        </button>
        <button
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
