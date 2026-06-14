# Masidy Chatbot - Quick Start

## Status

✅ **Project Setup Complete**
- Dependencies installed
- `.env.local` created with configuration template
- Ready for database setup

## Next Steps

### 1. Set Up Your Environment (.env.local)

Update the file at `chatbot/.env.local` with your actual values:

**Critical (Required):**
```
AUTH_SECRET=your-secret-here
POSTGRES_URL=your-db-url-here
REDIS_URL=your-redis-url-here
BLOB_READ_WRITE_TOKEN=your-blob-token-here
GROQ_API_KEY=your-groq-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Optional (for additional features):**
- `LANGSEARCH_API_KEY` — Web search
- `OPENROUTER_API_KEY` — Alternative AI models
- `STRIPE_*` — Billing features
- `V0_API_KEY` — UI generation

### 2. Quick Setup Paths

**Path A: Vercel (Recommended for quick testing)**
1. Create Vercel PostgreSQL database
2. Create Vercel Redis cache
3. Create Vercel Blob token
4. Get free Groq API key: https://console.groq.com/keys
5. Copy credentials to `.env.local`

**Path B: Local Docker (for local development)**
```bash
# Terminal 1: PostgreSQL
docker run --name masidy-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
# Add to .env.local: POSTGRES_URL=postgresql://postgres:password@localhost:5432/postgres

# Terminal 2: Redis
docker run --name masidy-redis -d -p 6379:6379 redis
# Add to .env.local: REDIS_URL=redis://localhost:6379
```

### 3. Run Database Migrations

Once `.env.local` is configured with database credentials:

```bash
cd c:\Users\ragab\Desktop\masidy-bot\chatbot
pnpm db:migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Available Commands

```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio (database UI)
pnpm db:generate      # Generate migrations after schema changes
pnpm check            # Run code quality checks
pnpm test             # Run tests
```

## Key Features

✨ **AI Models:**
- Groq (free Llama 3.1) — **Default**
- OpenAI (requires API key)
- OpenRouter (alternative models)

📝 **Capabilities:**
- Real-time web search
- Document analysis (PDF, TXT, MD)
- Memory across conversations
- Voice input/output
- Document creation & editing
- Multi-language support

💳 **Billing:**
- Free tier
- Plus ($5/month)
- Pro ($10/month)
- Stripe integration

## Troubleshooting

**Commands not found?**
- Make sure you're in: `c:\Users\ragab\Desktop\masidy-bot\chatbot`
- Run: `pnpm install` first

**Database connection failed?**
- Check `POSTGRES_URL` in `.env.local`
- Ensure PostgreSQL is running
- Test with: `psql <your-connection-string>`

**Missing API keys?**
- Get Groq key (free): https://console.groq.com/keys
- App still works without optional APIs

## File Structure

```
/app
  /(auth)    → Login & authentication
  /(chat)    → Main chat interface
    /api     → Backend endpoints

/lib
  /ai        → AI models & prompts
  /db        → Database & queries
  /artifacts → Document management
```

## Next: Explore

1. Edit `.env.local` with your credentials
2. Run `pnpm db:migrate`
3. Run `pnpm dev`
4. Try it out at http://localhost:3000

See `SETUP_GUIDE.md` for detailed setup instructions.
