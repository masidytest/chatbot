"use client";

import { DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Don't show if already installed or no prompt available
  if (installed || !prompt) return null;

  const handleInstall = async () => {
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
      setPrompt(null);
    }
  };

  return (
    <button
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      onClick={handleInstall}
      type="button"
      title="Install Masidy as an app"
    >
      <DownloadIcon className="size-4" />
      <span>Install app</span>
    </button>
  );
}
