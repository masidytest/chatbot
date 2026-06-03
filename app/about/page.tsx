import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="border-b border-border/40 bg-sidebar px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <MasidyAnimatedIcon animate size={56} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">About Masidy</h1>
          <p className="mt-3 text-lg text-muted-foreground">The AI that works harder for less.</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">What is Masidy?</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Masidy is a personal AI assistant built to be genuinely useful. Search the web in real time,
              check live weather and stock prices, summarize webpages, remember things about you
              across conversations, write code, and more — all from one place.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Paid plans unlock more powerful models: Masidy Code for programming, Masidy Speed with
              image understanding, Masidy Flash — the most capable model on the platform — and more.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our approach</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Most AI products give you a chatbot. Masidy gives you an engine. Every message goes through
              a pipeline: detect what you need → retrieve the right information → generate a precise answer.
              That's why it feels different — it's actually working for you, not just generating text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Who is it for?</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Anyone who wants a capable AI without paying premium prices. Students, developers,
              writers, researchers, professionals — the free tier is genuinely free with no hidden limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Privacy</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Your conversations are stored securely in your account and are private by default.
              You can delete all your data at any time from your dashboard. We do not sell your
              data or use it to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">The team</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Masidy is built by a small, focused team that believes AI should be accessible to everyone.
              Independent, not backed by big tech. We build in public and listen to our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Questions, feedback, or partnership inquiries:{" "}
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
