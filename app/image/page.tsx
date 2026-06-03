"use client";

import {
  ArrowLeftIcon,
  DownloadIcon,
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
type Quality = "schnell" | "dev" | "pro";

const ASPECT_RATIOS: { value: AspectRatio; label: string; w: number; h: number }[] = [
  { value: "1:1",  label: "Square",    w: 1, h: 1 },
  { value: "16:9", label: "Landscape", w: 16, h: 9 },
  { value: "9:16", label: "Portrait",  w: 9, h: 16 },
  { value: "4:3",  label: "Standard",  w: 4, h: 3 },
  { value: "3:4",  label: "Tall",      w: 3, h: 4 },
];

const STYLE_PRESETS = [
  "Photorealistic",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "3D Render",
  "Anime",
  "Sketch",
  "Cinematic",
  "Minimalist",
  "Abstract",
];

type GeneratedImage = {
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  quality: Quality;
  timestamp: Date;
};

export default function ImageStudioPage() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality] = useState<Quality>("schnell");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userPlan = "free"; // Will fetch from /api/billing/status

  const fullPrompt = style ? `${prompt}, ${style} style` : prompt;

  async function generate() {
    if (!prompt.trim()) return;
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio, quality }),
      });
      const data = await res.json() as { url?: string; error?: string };

      if (data.url) {
        const img: GeneratedImage = {
          url: data.url,
          prompt: fullPrompt,
          aspectRatio,
          quality,
          timestamp: new Date(),
        };
        setCurrent(img);
        setHistory((prev) => [img, ...prev.slice(0, 19)]);
      } else {
        setError(data.error ?? "Generation failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string, prompt: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `masidy-${prompt.slice(0, 30).replace(/\s+/g, "-")}.webp`;
      a.click();
    } catch {
      window.open(url, "_blank");
    }
  }

  const ar = ASPECT_RATIOS.find((r) => r.value === aspectRatio) ?? ASPECT_RATIOS[0];
  const previewAspect = `${ar.w} / ${ar.h}`;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-sidebar/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors" href="/">
            <ArrowLeftIcon className="size-4" />
            <span>Back to chat</span>
          </Link>
          <div className="flex items-center gap-2">
            <MasidyAnimatedIcon animate={false} size={20} />
            <span className="font-bold text-foreground text-sm">MASIDY</span>
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-500">Image Studio</span>
          </div>
          <Link href="/pricing" className="text-[12px] text-orange-500 hover:text-orange-400">
            Upgrade →
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">

          {/* Left — Controls */}
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-foreground">Image Studio</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">Describe anything. Generate in seconds.</p>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Prompt</label>
              <textarea
                ref={textareaRef}
                className="w-full resize-none rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-orange-500/40 focus:outline-none focus:ring-0 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
                }}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain lake at sunrise with mist rising from the water..."
                rows={4}
                value={prompt}
              />
              <p className="text-[11px] text-muted-foreground/50">Ctrl+Enter to generate</p>
            </div>

            {/* Style presets */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Style</label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_PRESETS.map((s) => (
                  <button
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-all",
                      style === s
                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                        : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                    key={s}
                    onClick={() => setStyle(style === s ? null : s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border py-2.5 text-center transition-all",
                      aspectRatio === r.value
                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                        : "border-border/40 text-muted-foreground hover:border-border"
                    )}
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    type="button"
                  >
                    <div
                      className={cn(
                        "mb-1 rounded-sm border-2",
                        aspectRatio === r.value ? "border-orange-500" : "border-muted-foreground/40"
                      )}
                      style={{
                        width: r.w <= r.h ? 12 : 20,
                        height: r.h <= r.w ? 12 : 20,
                        aspectRatio: `${r.w}/${r.h}`,
                        minWidth: 10,
                        minHeight: 10,
                      }}
                    />
                    <span className="text-[10px] font-medium">{r.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Quality</label>
              <div className="space-y-1.5">
                {[
                  { value: "schnell" as Quality, label: "Standard",    desc: "Fast generation",       plan: "Free",  icon: null },
                  { value: "dev"     as Quality, label: "High Quality",desc: "Better detail & realism",plan: "Plus",  icon: ZapIcon },
                  { value: "pro"     as Quality, label: "Professional", desc: "Best quality output",   plan: "Pro",   icon: SparklesIcon },
                ].map((q) => (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      quality === q.value
                        ? "border-orange-500/50 bg-orange-500/5"
                        : "border-border/40 hover:border-border"
                    )}
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    type="button"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">{q.label}</span>
                        <span className={cn(
                          "rounded-full px-1.5 py-px text-[10px] font-semibold",
                          q.plan === "Free" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          q.plan === "Plus" ? "bg-blue-500/10 text-blue-500" :
                          "bg-orange-500/10 text-orange-500"
                        )}>
                          {q.plan}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{q.desc}</span>
                    </div>
                    <div className={cn(
                      "size-4 rounded-full border-2 transition-all",
                      quality === q.value ? "border-orange-500 bg-orange-500" : "border-border"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-500">
                {error}
              </div>
            )}

            {/* Generate button */}
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 border-0 text-white h-11 text-[14px] font-semibold"
              disabled={loading || !prompt.trim()}
              onClick={generate}
              type="button"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 size-4" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Right — Preview + History */}
          <div className="space-y-4">
            {/* Main canvas */}
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/20"
              style={{ aspectRatio: previewAspect, maxHeight: "70vh" }}
            >
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <Loader2Icon className="size-6 animate-spin text-orange-500" />
                  </div>
                  <p className="text-[13px] font-medium text-foreground">Generating your image...</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Usually takes 3–10 seconds</p>
                </div>
              )}

              {!loading && !current && (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-orange-500/10">
                    <ImageIcon className="size-8 text-orange-500/60" />
                  </div>
                  <p className="text-[14px] font-medium text-foreground">Your image will appear here</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Enter a prompt and click Generate</p>
                </div>
              )}

              {!loading && current && (
                <>
                  <img
                    alt={current.prompt}
                    className="h-full w-full object-contain"
                    src={current.url}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button
                      className="size-9 rounded-xl bg-background/90 border border-border/40 backdrop-blur-sm hover:bg-background"
                      onClick={() => downloadImage(current.url, current.prompt)}
                      size="icon"
                      title="Download"
                      variant="ghost"
                    >
                      <DownloadIcon className="size-4" />
                    </Button>
                    <Button
                      className="size-9 rounded-xl bg-background/90 border border-border/40 backdrop-blur-sm hover:bg-background"
                      onClick={generate}
                      size="icon"
                      title="Regenerate"
                      variant="ghost"
                    >
                      <RefreshCwIcon className="size-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* History grid */}
            {history.length > 1 && (
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
                  {history.slice(1).map((img, i) => (
                    <button
                      className="group relative overflow-hidden rounded-xl border border-border/40 bg-muted/20 transition-all hover:border-orange-500/40"
                      key={`${img.timestamp.getTime()}-${i}`}
                      onClick={() => setCurrent(img)}
                      style={{ aspectRatio: "1" }}
                      type="button"
                    >
                      <img
                        alt={img.prompt}
                        className="h-full w-full object-cover"
                        src={img.url}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
