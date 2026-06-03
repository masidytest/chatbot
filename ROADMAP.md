# Masidy Platform Roadmap

Live at: https://masidy.com
Vercel: https://chatbot-masidytests-projects.vercel.app
Brand: Orange dot grid icon + MASIDY wordmark, black/white text, orange accents only

---

## ✅ Already Done

### Core Platform
- [x] Next.js + Vercel deployment
- [x] Auth (email/password + guest sessions)
- [x] Chat with message history (Postgres)
- [x] Resumable streams (Redis)
- [x] File uploads (Vercel Blob — JPEG, PNG, PDF, TXT, MD)
- [x] Metadata + Open Graph tags for masidy.com

### Models (7 variants)
- [x] Masidy — Groq Llama 3.1 8B (free, fast, default)
- [x] Masidy Flash — Kimi K2.5 (everyday tasks)
- [x] Masidy Code — DeepSeek V3.2 (code & analysis)
- [x] Masidy Mini — GPT OSS 20B (quick tasks)
- [x] Masidy Pro — GPT OSS 120B (deep reasoning)
- [x] Masidy Speed — Grok 4.1 Fast (fastest)
- [x] Masidy Local — WebLLM browser inference (Phi-3.5-mini, WebGPU)

### Masidy Pipeline (understand → retrieve → generate)
- [x] Intent detection (definition, comparison, steps, analysis, weather, currency, image, QR, webpage, dictionary)
- [x] LangSearch web search (primary)
- [x] Wikipedia + DuckDuckGo fallback
- [x] RAG on user documents
- [x] Weather (Open-Meteo — free)
- [x] Currency exchange (ExchangeRate API — free)
- [x] Image generation (Pollinations.ai — free)
- [x] QR code generation (goqr.me — free)
- [x] Webpage summarizer
- [x] Dictionary lookup (Free Dictionary API)
- [x] Context window: 3000 chars, 6-message history

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

## 🔄 Needs Verification (Test on Live Site)

- [ ] Masidy Local (WebLLM) — test in Chrome after latest deploy
- [ ] Dashboard loads correctly after login
- [ ] Image generation shows inline in chat
- [ ] Memory saves and shows in dashboard

---

## 📋 Phase 1 — Make It Feel Great (Now)

**Goal: No limits, just a great product. Get first real users.**

- [ ] **YouTube summarizer** — paste a YouTube URL → get a summary (youtube-transcript, free)
- [ ] **Stock prices** — "what's AAPL price?" → live data (Yahoo Finance API, free)
- [ ] **News feed** — "latest news on X" → real headlines (NewsAPI free tier)
- [ ] **Better image quality** — upgrade from Pollinations to Replicate FLUX ($0.003/image)
- [ ] **Onboarding flow** — 2-step intro for new users (what Masidy can do + try it)
- [ ] **Mobile improvements** — test on phone, fix any layout issues

---

## 📋 Phase 2 — More Power (Next Week)

**Goal: Features that make users say "wow"**

- [ ] **Video generation** — "generate a video of X" → Luma Dream Machine / Kling (free tier)
- [ ] **AI App Builder mode** — dedicated UI for building apps with Masidy
  - Multi-file code editor (already have single file artifact)
  - Sandboxed execution (already have Pyodide for Python)
  - Project memory across messages
  - One-click deploy to Vercel
- [ ] **Better voice** — ElevenLabs free tier (10k chars/month) for natural TTS
- [ ] **Chart generation** — "make a bar chart of X" → QuickChart.io (free, already in pipeline)

---

## 📋 Phase 3 — Polish & Growth

**Goal: Make it look and feel premium. Start converting free users to paid.**

- [ ] **Landing page** at masidy.com (separate from the app)
  - Hero: "The AI that works harder for less"
  - Live demo embedded
  - Feature list vs ChatGPT
  - Pricing table (reveal when ready)
- [ ] **WhatsApp bot** — Twilio / WhatsApp Business API
- [ ] **Email notifications** — Resend.com free tier
- [ ] **Custom domain email** — hello@masidy.com

---

## 📋 Phase 4 — Monetization (When You Have Users)

**Goal: Add pricing only when users are already hooked**

- [ ] Define tiers based on what you observe (not before)
- [ ] Add subscription check to gate premium models
- [ ] Show upgrade nudge (never a hard block — just a friendly prompt)
- [ ] Stripe already connected at masidy.com — just needs the logic

**Rough pricing direction (decide later):**
| Tier | Price | What |
|---|---|---|
| Free | $0 | All features, generous limits |
| Plus | $5/month | Priority speed + video gen + app builder |
| Pro | $10/month | Everything + highest quality models |

---

## 🎨 Identity Rules (Never Change)

- **Primary color:** `#F97316` (orange) — logo only, never text
- **Text:** black in light mode, white in dark mode
- **Font:** Geist
- **Logo mark:** animated orange dot grid
- **Wordmark:** MASIDY bold, all caps, currentColor
- **Models:** always named "Masidy [X]" — never show underlying model name
- **Voice:** "I am Masidy, created by the Masidy team" — never mentions Groq, Kimi, DeepSeek, Microsoft, Meta, etc.

---

## 🔑 Environment Variables

```
NEXT_PUBLIC_BASE_URL=https://masidy.com
AUTH_SECRET=****
POSTGRES_URL=****
REDIS_URL=****
BLOB_READ_WRITE_TOKEN=****
GROQ_API_KEY=gsk_****        # Free — Llama 3.1 8B
LANGSEARCH_API_KEY=sk-****   # Free — web search
HF_API_TOKEN=hf_****         # HuggingFace
AI_GATEWAY_API_KEY=****      # Vercel AI Gateway (Flash/Code/Pro/Speed)
```

**To add in Phase 1:**
```
REPLICATE_API_KEY=****       # Image generation (FLUX — $0.003/image)
NEWS_API_KEY=****            # NewsAPI free tier
```

---

## 📌 Daily Working Order

1. Open this file
2. Pick the next unchecked item from current phase
3. Build → test → push
4. Check it off
5. Repeat
