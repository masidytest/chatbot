"use client";

import { useEffect, useRef } from "react";
import { useWebLLM } from "@/hooks/use-web-llm";

interface WebLLMHandlerProps {
  isActive: boolean;
  onReady: (generate: WebLLMHandlerProps["generate"]) => void;
  onStatusChange: (status: string, progress?: number) => void;
  generate?: (
    systemPrompt: string,
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    onToken: (token: string) => void
  ) => Promise<string>;
}

export function WebLLMHandler({ isActive, onReady, onStatusChange }: WebLLMHandlerProps) {
  const { status, progress, progressText, isSupported, initialize, generate } = useWebLLM();
  const initializedRef = useRef(false);

  useEffect(() => {
    onStatusChange(status, progress);
  }, [status, progress, onStatusChange]);

  useEffect(() => {
    if (isActive && !initializedRef.current) {
      initializedRef.current = true;
      initialize().then((success) => {
        if (success) {
          onReady(generate);
        }
      });
    }
  }, [isActive, initialize, generate, onReady]);

  if (!isActive) return null;

  if (!isSupported()) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
        <strong>Masidy Local requires WebGPU</strong> — use Chrome or Edge on a modern device.
        Switching to server mode automatically.
      </div>
    );
  }

  if (status === "downloading" || status === "loading" || status === "checking") {
    return (
      <div className="mx-auto max-w-md space-y-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Loading Masidy Local</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{progressText || "Preparing model..."}</p>
        <p className="text-[11px] text-muted-foreground/60">
          First time only — model cached after download
        </p>
      </div>
    );
  }

  return null;
}
