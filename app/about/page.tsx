import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <MasidyAnimatedIcon animate size={56} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">About Masidy</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            The AI that works harder for less.
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">What is Masidy?</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Masidy is a personal AI assistant built to be genuinely useful. The free model searches the web in real time,
              generates images, checks weather and stock prices, summarizes YouTube videos and webpages, remembers things
              about you across conversations, and writes code. It runs on Groq Llama 3.1 8B — fast, free, and text-only.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Paid plans unlock more powerful models: Masidy Code for programming, Masidy Speed with image reading and 1 million
              token context, Masidy Flash with vision and 262K context, and more. Each model is honest about what it can and
              cannot do.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our approach</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Most AI products give you a chatbot. Masidy gives you an engine. Under the hood, the free Masidy model
              runs a pipeline: detect intent → retrieve relevant information from the web → summarize → generate a precise
              answer. That's why it feels different — it's actually looking things up, not just predicting the next word.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We don't promise things we can't deliver. The free model cannot read images or PDFs. It has an 8,000 token
              context limit. We say that clearly. If you need image reading, Masidy Speed (Plus) and Masidy Flash (Pro)
              support it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Who is it for?</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Anyone who wants a capable AI without paying premium prices. Students, developers,
              writers, researchers, professionals — anyone who asks questions and wants real answers,
              not hallucinations. The free tier is genuinely free with no hidden limits on the
              Masidy model.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Privacy</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Your conversations are stored securely in your account and are private by default.
              You can set any chat to public if you want to share it. You can delete all your
              data at any time from your dashboard. We do not sell your data or use it to train
              AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">The team</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Masidy is built by a small, focused team that believes AI should be accessible
              to everyone. We're independent, not backed by big tech. We build in public and
              listen to our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Questions, feedback, or partnership inquiries — reach us at{" "}
              <a className="text-orange-500 hover:text-orange-400" href="mailto:hello@masidy.com">
                hello@masidy.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
