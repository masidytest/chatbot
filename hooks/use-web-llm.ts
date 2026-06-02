"use client";

import { useCallback, useRef, useState } from "react";

export type WebLLMStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "loading"
  | "ready"
  | "generating"
  | "error"
  | "unsupported";

// Phi-3.5 Mini — fast, smart, 3.8B, perfect for browser
export const WEB_LLM_MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";
export const WEB_LLM_DISPLAY_NAME = "Masidy Local";
export const WEB_LLM_SIZE_MB = 2100;

type MLCEngine = {
  reload: (modelId: string) => Promise<void>;
  chat: {
    completions: {
      create: (params: {
        model?: string;
        messages: Array<{ role: string; content: string }>;
        stream: true;
        max_tokens?: number;
        temperature?: number;
      }) => Promise<AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>>;
    };
  };
};

export function useWebLLM() {
  const [status, setStatus] = useState<WebLLMStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const engineRef = useRef<MLCEngine | null>(null);

  const isSupported = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (!("gpu" in navigator)) return false;
    try {
      const adapter = await (navigator as Navigator & { gpu: { requestAdapter: () => Promise<unknown> } }).gpu.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }, []);

  const initialize = useCallback(async (): Promise<boolean> => {
    const supported = await isSupported();
    if (!supported) {
      setStatus("unsupported");
      return false;
    }
    if (engineRef.current) return true;
    if (status === "loading" || status === "downloading") return false;

    try {
      setStatus("checking");

      const { MLCEngine } = await import("@mlc-ai/web-llm");

      setStatus("downloading");
      setProgress(0);

      const engine = new MLCEngine({
        initProgressCallback: (report: { progress: number; text: string }) => {
          const pct = Math.round(report.progress * 100);
          setProgress(pct);
          setProgressText(report.text || "");
          if (pct < 100) setStatus("downloading");
          else setStatus("loading");
        },
      });

      await engine.reload("Phi-3.5-mini-instruct-q4f16_1-MLC");
      console.log("WebLLM: model loaded successfully");
      engineRef.current = engine as unknown as MLCEngine;
      setStatus("ready");
      setProgress(100);
      return true;
    } catch (e) {
      console.error("WebLLM init failed:", e);
      setStatus("error");
      return false;
    }
  }, [isSupported, status]);

  const generate = useCallback(
    async (
      systemPrompt: string,
      userMessages: Array<{ role: "user" | "assistant"; content: string }>,
      onToken: (token: string) => void
    ): Promise<string> => {
      if (!engineRef.current) throw new Error("Engine not ready");
      setStatus("generating");

      const messages = [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ];

      try {
        const chunks = await engineRef.current.chat.completions.create({
          model: WEB_LLM_MODEL_ID,
          messages,
          stream: true,
          max_tokens: 512,
          temperature: 0.7,
        });
        let full = "";
        for await (const chunk of chunks) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) {
            full += token;
            onToken(token);
          }
        }
        setStatus("ready");
        return full;
      } catch (e) {
        setStatus("ready");
        throw e;
      }
    },
    []
  );

  return {
    status,
    progress,
    progressText,
    isSupported,
    initialize,
    generate,
    isReady: status === "ready",
    isLoading: ["downloading", "loading", "checking"].includes(status),
    isGenerating: status === "generating",
  };
}
