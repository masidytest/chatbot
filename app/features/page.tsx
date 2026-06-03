"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CodeIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LanguagesIcon,
  MicIcon,
  QrCodeIcon,
  SearchIcon,
  TrendingUpIcon,
  VideoIcon,
  CloudIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Web Search",
    desc: "Real-time search across the web using LangSearch, Wikipedia, and DuckDuckGo. Always up-to-date answers.",
    tag: "Free",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    desc: "Generate images from any description. Powered by Pollinations.ai — no credits needed.",
    tag: "Free",
  },
  {
    icon: CloudIcon,
    title: "Weather",
    desc: "Live weather data for any city — temperature, humidity, wind speed, and conditions.",
    tag: "Free",
  },
  {
    icon: TrendingUpIcon,
    title: "Stock Prices",
    desc: "Real-time stock and crypto prices. Ask about AAPL, TSLA, BTC, ETH — get live data instantly.",
    tag: "Free",
  },
  {
    icon: VideoIcon,
    title: "YouTube Summarizer",
    desc: "Paste any YouTube link and get a full summary of the video. No need to watch.",
    tag: "Free",
  },
  {
    icon: GlobeIcon,
    title: "Webpage Summarizer",
    desc: "Paste any URL and Masidy reads and summarizes the page for you.",
    tag: "Free",
  },
  {
    icon: BrainIcon,
    title: "Memory",
    desc: "Masidy remembers things about you across all conversations — your name, preferences, interests.",
    tag: "Free",
  },
  {
    icon: FileTextIcon,
    title: "Document Analysis",
    desc: "Upload PDF, TXT, or Markdown files. Masidy reads and answers questions about your documents.",
    tag: "Free",
  },
  {
    icon: MicIcon,
    title: "Voice Input & Output",
    desc: "Speak to Masidy and listen to responses. Full voice interface built into the browser.",
    tag: "Free",
  },
  {
    icon: LanguagesIcon,
    title: "Multilingual",
    desc: "Masidy auto-detects your language and responds in it. Arabic, English, French, Chinese, and more.",
    tag: "Free",
  },
  {
    icon: QrCodeIcon,
    title: "QR Code Generator",
    desc: 'Say "generate QR code for masidy.com" and get a scannable QR code instantly.',
    tag: "Free",
  },
  {
    icon: CodeIcon,
    title: "Code Assistant",
    desc: "Write, debug, explain, and review code in any language. Use Masidy Code for the best results.",
    tag: "Plus",
  },
  {
    icon: ZapIcon,
    title: "6 AI Models",
    desc: "Masidy, Flash, Code, Mini, Max, Speed — each optimized for different tasks. Free model always available.",
    tag: "Free / Paid",
  },
  {
    icon: SparklesIcon,
    title: "News Feed",
    desc: 'Ask "latest news on AI" or any topic — get real headlines from across the web.',
    tag: "Free",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            href="/"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to chat
          </Link>
          <div className="flex items-center gap-2">
            <MasidyAnimatedIcon animate={false} size={22} />
            <span className="font-bold text-foreground">MASIDY</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Everything Masidy can do
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            One AI. Dozens of capabilities. Most are completely free.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              className="rounded-2xl border border-border/40 bg-card/50 p-5 transition-colors hover:border-orange-500/20"
              key={f.title}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10">
                  <f.icon className="size-4 text-orange-500" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  f.tag === "Free"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : f.tag === "Plus"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="mb-1.5 text-[14px] font-semibold text-foreground">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Ready to try it?</h2>
          <p className="mb-6 text-muted-foreground">Everything above is free to use. No credit card needed to start.</p>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            href="/"
          >
            Start chatting for free
          </Link>
        </div>
      </div>
    </div>
  );
}
