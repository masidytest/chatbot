"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CloudIcon,
  CodeIcon,
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  HammerIcon,
  GaugeIcon,
  LayersIcon,
  LanguagesIcon,
  MicIcon,
  QrCodeIcon,
  ScanEyeIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  WandIcon,
  ZapIcon,
  MessageSquareIcon,
  BotIcon,
  GiftIcon,
  MemoryStickIcon,
  ImageIcon,
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
          <p className="mt-3 text-lg text-muted-foreground">11 models. One platform. Most completely free, all with tools.</p>
        </div>

        {/* FREE MODELS SECTION */}
        <div className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-green-500/10">
              <GiftIcon className="size-4 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              6 Free Models
              <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-[12px] font-semibold text-green-600 dark:text-green-400">Always free · No card needed</span>
            </h2>
          </div>
          <p className="mb-6 text-[14px] text-muted-foreground">
            Every account — including the free tier — gets access to all 6 of these models with unlimited messages. No credits consumed.
          </p>

          {/* 6 model cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {[
              {
                name: "Masidy",
                icon: <img alt="Masidy" src="/masidy-icon.svg" className="size-4" />,
                tag: "Search + Memory + Tools",
                tagColor: "bg-orange-500/10 text-orange-500",
                items: [
                  "Live web search — always current results",
                  "Live weather for any city worldwide",
                  "Stock & crypto prices in real time",
                  "Webpage reader and summarizer",
                  "Latest news on any topic",
                  "QR code generator",
                  "Dictionary and definitions",
                  "Memory across all conversations",
                  "Multilingual — answers in your language",
                  "Write, explain, and debug code",
                ],
              },
              {
                name: "Masidy Nano",
                icon: <SparklesIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Fast everyday assistant",
                tagColor: "bg-green-500/10 text-green-600 dark:text-green-400",
                items: [
                  "Fast responses for everyday questions",
                  "Writing, summarizing, and editing",
                  "General Q&A and explanations",
                  "Tool use: live weather, document creation, suggestions",
                  "Zero credits — always free",
                ],
              },
              {
                name: "Masidy Core",
                icon: <LayersIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Strong reasoning",
                tagColor: "bg-green-500/10 text-green-600 dark:text-green-400",
                items: [
                  "Deep reasoning and complex analysis",
                  "Research, comparisons, and reports",
                  "Multi-step problem solving",
                  "Tool use: live weather, document creation, suggestions",
                  "Zero credits — always free",
                ],
              },
              {
                name: "Masidy Build",
                icon: <HammerIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Best free coder",
                tagColor: "bg-green-500/10 text-green-600 dark:text-green-400",
                items: [
                  "Best free coding model on the platform",
                  "Complex software engineering tasks",
                  "Coding and debugging workflows",
                  "Tool use: live weather, document creation, suggestions",
                  "Zero credits — always free",
                ],
              },
              {
                name: "Masidy Vision",
                icon: <ScanEyeIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Image understanding",
                tagColor: "bg-green-500/10 text-green-600 dark:text-green-400",
                items: [
                  "Reads and analyzes images you send",
                  "Describe, interpret, and extract text from images",
                  "Visual Q&A and image comparisons",
                  "Tool use: live weather, document creation, suggestions",
                  "Zero credits — always free",
                ],
              },
              {
                name: "Masidy Think",
                icon: <WandIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Compact fast coder",
                tagColor: "bg-green-500/10 text-green-600 dark:text-green-400",
                items: [
                  "Quick code fixes and debugging",
                  "Code explanations and walkthroughs",
                  "Fast, compact responses",
                  "Tool use: live weather, document creation, suggestions",
                  "Zero credits — always free",
                ],
              },
            ].map((m) => (
              <div className="rounded-xl border border-green-500/20 bg-card/50 p-5" key={m.name}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span className="text-[14px] font-bold text-foreground">{m.name}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.tagColor}`}>{m.tag}</span>
                </div>
                <ul className="space-y-1.5">
                  {m.items.map((item) => (
                    <li className="text-[12px] leading-relaxed text-muted-foreground" key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Free model capabilities grid */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-6">
            <h3 className="mb-4 text-[14px] font-semibold text-foreground">Capabilities included with the free Masidy model</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: SearchIcon,        title: "Web Search",            desc: "Live results. Never outdated." },
                { icon: CloudIcon,         title: "Live Weather",          desc: "Any city, real-time conditions." },
                { icon: TrendingUpIcon,    title: "Stocks & Crypto",       desc: "Live prices for any ticker." },
                { icon: GlobeIcon,         title: "Webpage Summarizer",    desc: "Paste a URL, get a summary." },
                { icon: SparklesIcon,      title: "Latest News",           desc: "Real headlines from the web." },
                { icon: QrCodeIcon,        title: "QR Code Generator",     desc: "Any URL or text, instant QR." },
                { icon: MemoryStickIcon,   title: "Memory",                desc: "Remembers you across sessions." },
                { icon: FileTextIcon,      title: "Document Upload",       desc: "Upload files, ask questions." },
                { icon: LanguagesIcon,     title: "Multilingual",          desc: "Responds in your language." },
                { icon: MicIcon,           title: "Voice Input",           desc: "Speak instead of typing." },
                { icon: CodeIcon,          title: "Coding",                desc: "Write and debug any language." },
                { icon: MessageSquareIcon, title: "Dictionary",            desc: "Definitions and phonetics." },
                { icon: ImageIcon,         title: "Image Generation",      desc: "Generate images from text." },
              ].map((f) => (
                <div className="rounded-xl border border-border/40 bg-card/50 p-4" key={f.title}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <f.icon className="size-4 text-orange-500" />
                    <span className="text-[13px] font-semibold text-foreground">{f.title}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All free models tools */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-6 mt-6">
            <h3 className="mb-4 text-[14px] font-semibold text-foreground">Tools available on all 6 free models</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: CloudIcon,    title: "Live Weather",         desc: "Get real-time weather for any location." },
                { icon: FileTextIcon, title: "Document Creation",    desc: "Create and format documents on demand." },
                { icon: CodeIcon,     title: "Document Editing",     desc: "Edit and modify documents instantly." },
                { icon: SparklesIcon, title: "Suggestions",          desc: "Get personalized recommendations." },
              ].map((f) => (
                <div className="rounded-xl border border-green-500/20 bg-card/50 p-4" key={f.title}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <f.icon className="size-4 text-green-500" />
                    <span className="text-[13px] font-semibold text-foreground">{f.title}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PLUS MODELS */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10">
              <ZapIcon className="size-4 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Plus Models
              <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[12px] font-semibold text-blue-500">$5/month · 1 credit/message</span>
            </h2>
          </div>
          <p className="mb-5 text-[14px] text-muted-foreground">Unlock the most capable paid models for coding, reasoning, vision, and speed.</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {[
              {
                name: "Masidy Code",
                icon: <CodeIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Coding · 164K context",
                items: [
                  "Best dedicated coding model on the platform",
                  "Write, debug, and refactor entire codebases",
                  "164K token context — fits large projects",
                  "Combined reasoning and tool use in one response",
                  "Algorithms, system design, technical analysis",
                  "Creates code files, documents, and spreadsheets",
                ],
              },
              {
                name: "Masidy Mini",
                icon: <BotIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Fast reasoning · 131K context",
                items: [
                  "Ultra-fast responses with strong reasoning",
                  "Tool use: create documents, code, spreadsheets",
                  "131K context window for long conversations",
                  "Math, logic, writing, and everyday tasks",
                  "Great balance of speed and intelligence",
                ],
              },
              {
                name: "Masidy Max",
                icon: <BrainIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Deepest reasoning · 131K context",
                items: [
                  "Strongest reasoning model on the platform",
                  "Complex research, deep analysis, multi-step tasks",
                  "Creates documents, code files, and spreadsheets",
                  "Long-form writing and comprehensive explanations",
                  "131K context for thorough analysis",
                ],
              },
              {
                name: "Masidy Speed",
                icon: <GaugeIcon className="size-4 text-foreground/70" strokeWidth={1.5} />,
                tag: "Vision · 1M context · Fastest",
                items: [
                  "Fastest model on the platform",
                  "Reads and analyzes images you send",
                  "Massive 1M token context window",
                  "Creates documents, code, and spreadsheets",
                  "Real-time tasks, instant responses",
                  "Best for speed-critical workflows",
                ],
              },
            ].map((m) => (
              <div className="rounded-xl border-2 border-blue-500/20 bg-card/50 p-5" key={m.name}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span className="text-[14px] font-bold text-foreground">{m.name}</span>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">{m.tag}</span>
                </div>
                <ul className="space-y-1.5">
                  {m.items.map((item) => (
                    <li className="text-[12px] leading-relaxed text-muted-foreground" key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* PRO MODEL */}
        <div className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10">
              <SparklesIcon className="size-4 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Pro Model
              <span className="ml-2 rounded-full bg-orange-500/15 px-2 py-0.5 text-[12px] font-semibold text-orange-500">$10/month · 3 credits/message</span>
            </h2>
          </div>
          <div className="rounded-xl border-2 border-orange-500/30 bg-card/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ZapIcon className="size-5 text-orange-500" />
              <span className="text-[16px] font-bold text-foreground">Masidy Flash</span>
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-500">Vision · 262K context · Most Capable</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {[
                "Reads and analyzes images you send",
                "262K token context — fits entire codebases",
                "Most capable model on the platform",
                "Advanced coding — full apps, UI, animations",
                "Creates documents, code, and spreadsheets",
                "Combined reasoning and tool use",
                "Agentic multi-step task completion",
                "Best for long documents, complex research",
                "Vision: describe, extract, and analyze images",
                "Ideal for demanding, high-stakes tasks",
              ].map((item) => (
                <div className="text-[13px] text-muted-foreground" key={item}>• {item}</div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Start with 6 free models</h2>
          <p className="mb-6 text-muted-foreground">No card needed. Upgrade only when you need the most powerful ones.</p>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600" href="/">
            Start chatting for free
          </Link>
        </div>
      </div>
    </div>
  );
}
