# Masidy Platform Roadmap

Live at: https://chatbot-masidytests-projects.vercel.app
Domain: masidy.com (connected to Stripe)
Brand: Orange dot grid icon + MASIDY wordmark, black/white text, orange accents only

---

## ✅ Already Done

### Core Platform
- [x] Next.js 16 + Vercel deployment
- [x] Auth (email/password + guest sessions)
- [x] Chat with message history (Postgres)
- [x] Resumable streams (Redis)
- [x] File uploads (Vercel Blob — JPEG, PNG, PDF, TXT, MD)

### Models (6 variants)
- [x] Masidy — Groq Llama 3.1 8B (free, fast, default)
- [x] Masidy Flash — Kimi K2.5 (everyday tasks)
- [x] Masidy Code — DeepSeek V3.2 (code & analysis)
- [x] Masidy Mini — GPT OSS 20B (quick tasks)
- [x] Masidy Pro — GPT OSS 120B (deep reasoning)
- [x] Masidy Speed — Grok 4.1 Fast (fastest)

### Masidy Pipeline (understand → retrieve → generate)
- [x] Intent detection (definition, comparison, steps, analysis, weather, currency, image, QR, webpage, dictionary)
- [x] LangSearch web search (primary)
- [x] Wikipedia + DuckDuckGo fallback
- [x] RAG on user documents
- [x] Weather (Open-Meteo)
- [x] Currency exchange (ExchangeRate API)
- [x] Image generation (Pollinations.ai)
- [x] QR code generation
- [x] Webpage summarizer
- [x] Dictionary lookup

### User Features
- [x] Memory across conversations
- [x] Voice input (Web Speech API)
- [x] Voice output (TTS)
- [x] Multilingual auto-detect
- [x] Dashboard (profile, stats, memory, documents, settings)
- [x] Message voting (thumbs up/down)
- [x] Chat visibility (public/private)

### Branding
- [x] Orange animated dot grid logo
- [x] MASIDY wordmark (black light / white dark)
- [x] Custom icons per model
- [x] Masidy branding on auth pages
- [x] Favicon

---

## 🔄 In Progress / Needs Fix

- [x] Masidy Local (WebLLM) — fixed chat.completions.create API usage
- [x] Masidy model token limit fix — increased context from 800 to 3000 chars, history from 3 to 6 messages
- [x] Metadata updated — masidy.com as base URL, proper Open Graph tags
- [ ] Dashboard accessible after login (verify it works end-to-end — looks good but needs test)
- [ ] Rate limits (currently 100/hr — need to set proper free/pro tiers)

---

## 📋 Phase 1 — Foundation (This Week)

**Goal: Make what we have production-ready**

- [ ] Set free tier: 20 messages/day, Masidy model only
- [ ] Set Pro tier logic: unlimited + all models (Stripe already connected at masidy.com)
- [ ] Add usage counter per user per day to DB
- [ ] Show "upgrade" prompt when free limit hit (not a hard block, a gentle nudge)
- [ ] Fix dashboard data loading
- [x] Update metadata: title, description, og:image for masidy.com
- [x] Set `NEXT_PUBLIC_BASE_URL` in Vercel to masidy.com

---

## 📋 Phase 2 — Media Generation (Week 2)

**Goal: Add image + video generation**

- [ ] Upgrade image generation: Replicate FLUX API ($0.003/image, much higher quality than Pollinations)
  - Add `REPLICATE_API_KEY` env var
  - Replace Pollinations call in pipeline.ts
  - Show generated image inline in chat
- [ ] Add video generation: Kling API or Luma Dream Machine
  - Detect "generate video of X" intent
  - Return video URL in chat
- [ ] Better TTS: ElevenLabs free tier (10k chars/month) for higher quality voice

---

## 📋 Phase 3 — AI App Builder (Week 3)

**Goal: Users can build and deploy apps with Masidy**

- [ ] Multi-file code editor in artifacts (already have single file)
- [ ] Sandboxed code execution (already have Pyodide for Python)
- [ ] Project context: remember full codebase across messages
- [ ] One-click deploy to Vercel via Vercel API
- [ ] Show "Masidy App Builder" as a separate mode in the UI

---

## 📋 Phase 4 — More Tools (Week 4)

**Goal: More free API integrations**

- [ ] Stock prices: Yahoo Finance API (free)
- [ ] YouTube summarizer: youtube-transcript API (free)
- [ ] News feed: NewsAPI free tier
- [ ] Color palette generator: colormind.io (free)
- [ ] URL shortener: TinyURL API (free)
- [ ] Chart generation: QuickChart.io (already in pipeline, expose to UI)

---

## 📋 Phase 5 — Polish & Growth

**Goal: Make it feel premium**

- [ ] Landing page at masidy.com (separate from app)
  - Hero: "The AI that works harder for less"
  - Pricing table: Free / Pro $5 / Pro $10
  - Feature comparison vs ChatGPT
- [ ] Custom Masidy logo (proper design, not just SVG)
- [ ] Mobile responsive improvements
- [ ] WhatsApp bot integration (Twilio or WhatsApp Business API)
- [ ] Onboarding flow for new users (2-3 step intro)
- [ ] Email notifications (Resend.com free tier)

---

## 💰 Pricing Strategy

| Tier | Price | What |
|---|---|---|
| Free | $0 | 20 msg/day, Masidy model only |
| Plus | $5/month | Unlimited, Masidy + Flash + Code |
| Pro | $10/month | Everything + Pro + Speed + App Builder + Video |

**Cost per user at $10/month:**
- API costs: ~$2-3/month
- Margin: ~$7/month

**Break-even:**
- 100 users, 5% paying = 5 users × $7 = $35 covers costs

---

## 🎨 Identity Rules (Never Change)

- **Primary color:** `#F97316` (orange) — logo only, never text
- **Text:** black in light mode, white in dark mode
- **Font:** Geist (already set)
- **Logo mark:** animated orange dot grid
- **Wordmark:** MASIDY bold, all caps, currentColor
- **Models:** always named "Masidy [X]" — never show underlying model name to users
- **Voice:** Masidy identifies itself as "Masidy, created by the Masidy team" — never mentions Groq, Kimi, DeepSeek

---

## 🔑 Environment Variables (Current)

```
NEXT_PUBLIC_BASE_URL=https://masidy.com
AUTH_SECRET=****
POSTGRES_URL=****
REDIS_URL=****
BLOB_READ_WRITE_TOKEN=****
GROQ_API_KEY=gsk_****       # Free Llama 3.1 8B
LANGSEARCH_API_KEY=sk-****  # Free web search
HF_API_TOKEN=hf_****        # HuggingFace
AI_GATEWAY_API_KEY=****     # Vercel AI Gateway (for Flash/Code/Pro/Speed)
```

**To add in Phase 2:**
```
REPLICATE_API_KEY=****      # Image generation (FLUX)
ELEVENLABS_API_KEY=****     # Voice (free tier)
```

---

## 📌 Daily Working Order

1. Check this file first
2. Pick the next unchecked item from current phase
3. Build it, test it, push it
4. Check it off
5. Repeat

