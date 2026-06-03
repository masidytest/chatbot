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
  MessageSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Web Search",
    desc: "Real-time search across the web using LangSearch, Wikipedia, and DuckDuckGo. Always current answers, not outdated training data.",
    tag: "Free",
    works: true,
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    desc: 'Say "draw a sunset over mountains" and Masidy generates an image instantly. Powered by Pollinations.ai.',
    tag: "Free",
    works: true,
  },
  {
    icon: CloudIcon,
    title: "Live Weather",
    desc: "Real-time weather for any city — temperature, humidity, wind, and conditions. Ask: 'weather in Cairo'.",
    tag: "Free",
    works: true,
  },
  {
    icon: TrendingUpIcon,
    title: "Stock & Crypto Prices",
    desc: "Live prices for stocks and crypto. Ask: 'what is Tesla stock price?' or 'bitcoin price'.",
    tag: "Free",
    works: true,
  },
  {
    icon: VideoIcon,
    title: "YouTube Summarizer",
    desc: "Paste any YouTube URL and get a full summary of the video without watching it.",
    tag: "Free",
    works: true,
  },
  {
    icon: GlobeIcon,
    title: "Webpage Summarizer",
    desc: "Paste any URL and Masidy reads and summarizes the page content for you.",
    tag: "Free",
    works: true,
  },
  {
    icon: SparklesIcon,
    title: "Latest News",
    desc: "Ask 'latest news on AI' or any topic and get real headlines from the web.",
    tag: "Free",
    works: true,
  },
  {
    icon: QrCodeIcon,
    title: "QR Code Generator",
    desc: 'Say "generate QR code for masidy.com" and get a scannable QR code in seconds.',
    tag: "Free",
    works: true,
  },
  {
    icon: BrainIcon,
    title: "Memory",
    desc: "Masidy remembers things you tell it — your name, preferences, interests — across all conversations.",
    tag: "Free",
    works: true,
  },
  {
    icon: LanguagesIcon,
    title: "Multilingual",
    desc: "Masidy auto-detects your language and responds in it. Arabic, English, French, Spanish, Chinese, and more.",
    tag: "Free",
    works: true,
  },
  {
    icon: FileTextIcon,
    title: "Document Upload",
    desc: "Upload TXT or Markdown files and ask questions about their content. Masidy reads and answers from your documents.",
    tag: "Free",
    works: true,
  },
  {
    icon: MessageSquareIcon,
    title: "Dictionary",
    desc: "Ask for the definition of any word — phonetics, part of speech, and meaning.",
    tag: "Free",
    works: true,
  },
  {
    icon: CodeIcon,
    title: "Coding Assistant",
    desc: "Write, debug, explain, and review code in any language. Use Masidy Code (Plus) for the best results.",
    tag: "Free + Plus",
    works: true,
  },
  {
    icon: MicIcon,
    title: "Voice Input",
    desc: "Speak your message instead of typing. Works in Chrome and Edge on desktop. Uses your browser's built-in speech recognition.",
    tag: "Free",
    works: true,
  },
  {
    icon: ZapIcon,
    title: "6 AI Models",
    desc: "Choose the right model for the task. Masidy is free forever. Flash, Code, Mini, Max, Speed available on paid plans.",
    tag: "Free / Paid",
    works: true,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-dvh bg-background">
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
            One AI. Real capabilities. Most are completely free.
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
          <p className="mb-6 text-muted-foreground">Everything above is free to start. No credit card needed.</p>
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
