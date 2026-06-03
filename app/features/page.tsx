"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CloudIcon,
  CodeIcon,
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  LanguagesIcon,
  MicIcon,
  QrCodeIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  ZapIcon,
  MessageSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

export default function FeaturesPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors" href="/">
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Everything Masidy can do</h1>
          <p className="mt-3 text-lg text-muted-foreground">One platform. Powerful capabilities across every plan.</p>
        </div>

        {/* FREE MODEL */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10">
              <img alt="Masidy" src="/masidy-icon.svg" className="size-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Masidy <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-[12px] font-semibold text-green-600 dark:text-green-400">Free forever</span></h2>
          </div>
          <p className="mb-5 text-[14px] text-muted-foreground">The default model — fast, capable, and free. Perfect for everyday tasks.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: SearchIcon,        title: "Web Search",            desc: "Live results from across the web. Always current, never outdated." },
              { icon: CloudIcon,         title: "Live Weather",          desc: "Current temperature, humidity, and conditions for any city in the world." },
              { icon: TrendingUpIcon,    title: "Stock & Crypto Prices", desc: "Live market prices for stocks and crypto. Ask about any ticker or company." },
              { icon: GlobeIcon,         title: "Webpage Summarizer",    desc: "Paste any URL and Masidy reads and summarizes the page for you." },
              { icon: SparklesIcon,      title: "Latest News",           desc: "Ask about any topic and get real headlines from the web." },
              { icon: QrCodeIcon,        title: "QR Code Generator",     desc: "Generate a scannable QR code for any URL or text instantly." },
              { icon: BrainIcon,         title: "Memory",                desc: "Masidy remembers your name, preferences, and facts across all conversations." },
              { icon: FileTextIcon,      title: "Document Upload",       desc: "Upload text files and ask questions about their content." },
              { icon: LanguagesIcon,     title: "Multilingual",          desc: "Responds in the language you write in — Arabic, French, Spanish, Chinese, and more." },
              { icon: MicIcon,           title: "Voice Input",           desc: "Speak instead of typing. Works in Chrome and Edge." },
              { icon: CodeIcon,          title: "Coding",                desc: "Write, explain, and debug code in any programming language." },
              { icon: MessageSquareIcon, title: "Dictionary",            desc: "Definitions, phonetics, and meanings for any word." },
            ].map((f) => (
              <div className="rounded-xl border border-border/40 bg-card/50 p-4" key={f.title}>
                <div className="mb-2 flex items-center gap-2">
                  <f.icon className="size-4 text-orange-500" />
                  <span className="text-[13px] font-semibold text-foreground">{f.title}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PLUS MODELS */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10">
              <ZapIcon className="size-4 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Plus Models <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[12px] font-semibold text-blue-500">$5/month</span></h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Masidy Code",
                tag: "Coding",
                color: "border-blue-500/20",
                items: [
                  "Best for writing and debugging code",
                  "Combined reasoning and tool use",
                  "Large context window for full codebases",
                  "Algorithms, system design, technical analysis",
                  "Creates code files, documents, and spreadsheets",
                ],
              },
              {
                name: "Masidy Mini",
                tag: "Fast reasoning",
                color: "border-blue-500/20",
                items: [
                  "Ultra-fast responses",
                  "Strong reasoning and problem solving",
                  "Creates documents, code, and spreadsheets",
                  "Great for everyday tasks and quick answers",
                  "Math, logic, writing, and more",
                ],
              },
              {
                name: "Masidy Max",
                tag: "Deep reasoning",
                color: "border-blue-500/20",
                items: [
                  "Strongest reasoning on the platform",
                  "Best for complex questions and research",
                  "Creates documents, code, and spreadsheets",
                  "Long-form writing and in-depth analysis",
                  "Multi-step problem solving",
                ],
              },
              {
                name: "Masidy Speed",
                tag: "Vision + Large context",
                color: "border-orange-500/20",
                items: [
                  "Fastest model on the platform",
                  "Reads and analyzes images you send",
                  "Massive context window for large documents",
                  "Creates documents, code, and spreadsheets",
                  "Built for speed and real-time tasks",
                ],
              },
            ].map((m) => (
              <div className={`rounded-xl border-2 ${m.color} bg-card/50 p-5`} key={m.name}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-bold text-foreground">{m.name}</span>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">{m.tag}</span>
                </div>
                <ul className="space-y-1.5">
                  {m.items.map((item) => (
                    <li className="text-[12px] leading-relaxed text-muted-foreground" key={item}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* PRO MODEL */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10">
              <SparklesIcon className="size-4 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Pro Model <span className="ml-2 rounded-full bg-orange-500/15 px-2 py-0.5 text-[12px] font-semibold text-orange-500">$10/month</span></h2>
          </div>
          <div className="rounded-xl border-2 border-orange-500/30 bg-card/50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <EyeIcon className="size-5 text-orange-500" />
              <span className="text-[15px] font-bold text-foreground">Masidy Flash</span>
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-500">Vision · Most Capable</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {[
                "Reads and analyzes images you send",
                "Largest context window on the platform",
                "Advanced coding — UI, animations, full apps",
                "Creates documents, code, and spreadsheets",
                "Combined reasoning and tool use",
                "Most capable model on the platform",
                "Agentic workflows and multi-step tasks",
                "Best for research and long document analysis",
              ].map((item) => (
                <div className="text-[13px] text-muted-foreground" key={item}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Start for free</h2>
          <p className="mb-6 text-muted-foreground">The free Masidy model handles most tasks. Upgrade only when you need more.</p>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600" href="/">
            Start chatting for free
          </Link>
        </div>
      </div>
    </div>
  );
}
