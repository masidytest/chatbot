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

export const WEB_LLM_MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";
export const WEB_LLM_DISPLAY_NAME = "Masidy Local";

export function useWebLLM() {
  const [status, setStatus] = useState<WebLLMStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  // Use any type for the engine since WebLLM types are complex
  // biome-ignore lint/suspicious/noExplicitAny: WebLLM engine
  const engineRef = useRef<any>(null);

  const isSupported = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (!("gpu" in navigator)) return false;
    try {
      // biome-ignore lint/suspicious/noExplicitAny: WebGPU API
      const nav = navigator as any;
      const adapter = await nav.gpu.requestAdapter();
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
      const webllm = await import("@mlc-ai/web-llm");
      const MLCEngine = webllm.MLCEngine;

      setStatus("downloading");
      setProgress(0);

      const engine = new MLCEngine({
        initProgressCallback: (report: { progress: number; text: string }) => {
          const pct = Math.round((report.progress ?? 0) * 100);
          setProgress(pct);
          setProgressText(report.text ?? "");
          if (pct >= 100) setStatus("loading");
        },
      });

      await engine.reload(WEB_LLM_MODEL_ID);
      engineRef.current = engine;
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
      const engine = engineRef.current;
      if (!engine) throw new Error("Engine not ready");
      setStatus("generating");

      const messages = [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ];

      try {
        // Use chat.completions.create — the only API in v0.2.x
        const stream = await engine.chat.completions.create({
          messages,
          stream: true,
          max_tokens: 512,
          temperature: 0.7,
        });

        let full = "";
        for await (const chunk of stream) {
          const token = chunk.choices?.[0]?.delta?.content ?? "";
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
