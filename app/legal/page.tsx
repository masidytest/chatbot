import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

export const metadata = {
  title: "Legal — Masidy",
};

export default function LegalPage() {
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
        {/* Nav between legal docs */}
        <div className="mb-10 flex gap-2">
          {["Terms", "Privacy", "Cookies"].map((t, i) => (
            <a
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              href={`#${t.toLowerCase()}`}
              key={t}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Terms */}
        <section className="mb-16" id="terms">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="mb-8 text-[13px] text-muted-foreground">Last updated: June 2026</p>

          <div className="space-y-6 text-[14px] leading-relaxed text-muted-foreground">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">1. Acceptance</h3>
              <p>By using Masidy, you agree to these terms. If you do not agree, do not use the service.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">2. Service</h3>
              <p>Masidy provides AI-powered chat and tools. We reserve the right to modify, suspend, or discontinue the service at any time. We will provide reasonable notice for significant changes.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">3. Account</h3>
              <p>You are responsible for your account security. Do not share your credentials. You must be 13 years or older to use Masidy.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">4. Acceptable Use</h3>
              <p>Do not use Masidy to generate illegal content, harass others, spread misinformation, attempt to circumvent safety measures, or violate any applicable laws. We may suspend accounts that violate these rules.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">5. Payments & Refunds</h3>
              <p>Subscriptions renew automatically. You may cancel at any time from your dashboard. Unused monthly credits do not carry over after cancellation. Top-up credits never expire and are non-refundable once added to your account.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">6. AI Outputs</h3>
              <p>AI-generated content may be inaccurate. Do not rely on Masidy for medical, legal, financial, or safety-critical decisions without verification from a qualified professional.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">7. Limitation of Liability</h3>
              <p>Masidy is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">8. Contact</h3>
              <p>Legal questions: <a className="text-orange-500 hover:text-orange-400" href="mailto:legal@masidy.com">legal@masidy.com</a></p>
            </div>
          </div>
        </section>

        <hr className="border-border/40 mb-16" />

        {/* Privacy */}
        <section className="mb-16" id="privacy">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mb-8 text-[13px] text-muted-foreground">Last updated: June 2026</p>

          <div className="space-y-6 text-[14px] leading-relaxed text-muted-foreground">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">What we collect</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Email address and password (hashed) when you create an account</li>
                <li>Chat messages you send and receive</li>
                <li>Files you upload for document analysis</li>
                <li>Usage data (message counts, model used) for billing</li>
                <li>Memories you explicitly share (name, preferences, etc.)</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">What we do NOT collect</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>We do not sell your data to third parties</li>
                <li>We do not use your conversations to train AI models</li>
                <li>We do not track you across other websites</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">How we use your data</h3>
              <p>To provide and improve the service, process payments, and communicate with you about your account. AI requests are processed through third-party providers (Groq, Vercel AI Gateway) under their respective privacy policies.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Data retention</h3>
              <p>Your data is stored as long as your account is active. You can delete all chats and memories from your dashboard at any time. To delete your account entirely, contact us at <a className="text-orange-500 hover:text-orange-400" href="mailto:privacy@masidy.com">privacy@masidy.com</a>.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Security</h3>
              <p>We use industry-standard encryption and security practices. Passwords are hashed and never stored in plain text. All connections are encrypted via HTTPS.</p>
            </div>
          </div>
        </section>

        <hr className="border-border/40 mb-16" />

        {/* Cookies */}
        <section id="cookies">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Cookie Policy</h1>
          <p className="mb-8 text-[13px] text-muted-foreground">Last updated: June 2026</p>

          <div className="space-y-6 text-[14px] leading-relaxed text-muted-foreground">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">What cookies we use</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong className="text-foreground">Session cookie</strong> — keeps you logged in across pages. Required for the service to work.</li>
                <li><strong className="text-foreground">Sidebar state</strong> — remembers whether your sidebar is open or closed.</li>
                <li><strong className="text-foreground">Model preference</strong> — remembers your last selected AI model.</li>
                <li><strong className="text-foreground">Theme</strong> — remembers light or dark mode preference.</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Third-party cookies</h3>
              <p>Stripe (our payment processor) may set cookies during checkout for fraud prevention. These are governed by <a className="text-orange-500 hover:text-orange-400" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe's privacy policy</a>.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">No tracking or advertising cookies</h3>
              <p>We do not use Google Analytics, Facebook Pixel, or any advertising network cookies. We do not track you across the web.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
