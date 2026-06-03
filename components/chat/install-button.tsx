"use client";

import { DownloadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed this session
    if (sessionStorage.getItem("install-dismissed")) return;
    // Show after 3 seconds
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("install-dismissed", "1");
    setShow(false);
  };

  // Detect platform for the right instruction
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const hint = isIOS
    ? "Tap Share → Add to Home Screen"
    : "Click the install icon in your browser address bar";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-300 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto">
      <div className="mx-3 mb-3 flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/98 px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur-xl md:mx-0 md:mb-0 md:min-w-[340px] md:px-5 md:py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <DownloadIcon className="size-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">Get Masidy on your device</p>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        <button
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleDismiss}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
