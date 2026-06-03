"use client";

import { DownloadIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: BeforeInstallPromptEvent not in TS types
  const promptRef = useRef<any>(null);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Dismissed this session
    if (sessionStorage.getItem("install-dismissed")) return;

    // Check if prompt was already captured (set before React loaded)
    // biome-ignore lint/suspicious/noExplicitAny: global
    if ((window as any).__installPrompt) {
      promptRef.current = (window as any).__installPrompt;
      setCanInstall(true);
    }

    // Also listen for future prompt events
    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after 2s
    const t = setTimeout(() => setShow(true), 2000);

    window.addEventListener("appinstalled", () => {
      setShow(false);
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (promptRef.current?.prompt) {
      await promptRef.current.prompt();
      const { outcome } = await promptRef.current.userChoice;
      if (outcome === "accepted") setShow(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("install-dismissed", "1");
    setShow(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2">
      <div className="mx-3 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-[var(--shadow-float)] md:mx-0 md:mb-0 md:min-w-[360px]">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <DownloadIcon className="size-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">Get Masidy on your device</p>
            <p className="text-[11px] text-muted-foreground">
              {isIOS ? "Tap Share → Add to Home Screen" : "Install as an app on this device"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {canInstall && !isIOS && (
            <button
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-orange-600"
              onClick={handleInstall}
              type="button"
            >
              Install
            </button>
          )}
          <button
            aria-label="Dismiss"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleDismiss}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
