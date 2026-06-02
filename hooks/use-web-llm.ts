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
export const WEB_LLM_MODEL_NAME = "Masidy Local (Phi-3.5)";

export function useWebLLM() {
  const [status, setStatus] = useState<WebLLMStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const engineRef = useRef<unknown>(null);

  const isSupported = useCallback(() => {
    if (typeof window === "undefined") return false;
    // Check WebGPU support
    return "gpu" in navigator;
  }, []);

  const initialize = useCallback(async () => {
    if (!isSupported()) {
      setStatus("unsupported");
      return false;
    }

    if (status === "ready") return true;
    if (status === "loading" || status === "downloading") return false;

    try {
      setStatus("checking");
      setProgress(0);

      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");

      setStatus("downloading");

      const engine = await CreateWebWorkerMLCEngine(
        new Worker(new URL("@mlc-ai/web-llm/worker", import.meta.url), { type: "module" }),
        WEB_LLM_MODEL_ID,
        {
          initProgressCallback: (report: { progress: number; text: string }) => {
            setProgress(Math.round(report.progress * 100));
            setProgressText(report.text);
            if (report.progress > 0 && report.progress < 1) {
              setStatus("downloading");
            } else if (report.progress >= 1) {
              setStatus("loading");
            }
          },
        }
      );

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
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
      onToken: (token: string) => void
    ): Promise<string> => {
      if (!engineRef.current || status !== "ready") {
        throw new Error("Engine not ready");
      }

      setStatus("generating");

      try {
        const engine = engineRef.current as {
          chat: {
            completions: {
              create: (params: {
                messages: Array<{ role: string; content: string }>;
                stream: boolean;
                max_tokens?: number;
                temperature?: number;
              }) => AsyncIterable<{
                choices: Array<{ delta: { content?: string } }>;
              }>;
            };
          };
        };

        const chunks = await engine.chat.completions.create({
          messages,
          stream: true,
          max_tokens: 512,
          temperature: 0.7,
        });

        let fullText = "";
        for await (const chunk of chunks) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            onToken(token);
          }
        }

        setStatus("ready");
        return fullText;
      } catch (e) {
        setStatus("ready");
        throw e;
      }
    },
    [status]
  );

  const reset = useCallback(() => {
    engineRef.current = null;
    setStatus("idle");
    setProgress(0);
    setProgressText("");
  }, []);

  return {
    status,
    progress,
    progressText,
    isSupported,
    initialize,
    generate,
    reset,
    isReady: status === "ready",
    isLoading: status === "downloading" || status === "loading" || status === "checking",
  };
}
