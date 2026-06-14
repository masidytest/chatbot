# Local Development Setup Guide

## Prerequisites

Before you can run Masidy locally, you need to set up the required services and API keys.

## 1. Database Setup (PostgreSQL)

### Option A: Using Vercel Postgres (Recommended)
1. Go to [Vercel Console](https://vercel.com/dashboard)
2. Create a new project or select existing one
3. Add Postgres database
4. Copy the `POSTGRES_URL` connection string
5. Add to `.env.local`: `POSTGRES_URL=your-connection-string`

### Option B: Local PostgreSQL (Docker)
```bash
# Run PostgreSQL in Docker
docker run --name masidy-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

# Connection string for .env.local:
POSTGRES_URL=postgresql://postgres:password@localhost:5432/postgres
```

### Option C: Local PostgreSQL (Windows)
1. [Download PostgreSQL](https://www.postgresql.org/download/windows/)
2. Install and remember your password
3. Create a database: `createdb masidy`
4. Connection string: `postgresql://postgres:your-password@localhost:5432/masidy`

## 2. Redis Setup (Cache)

### Option A: Using Vercel Redis
1. In [Vercel Console](https://vercel.com/dashboard), add Redis
2. Copy the connection string
3. Add to `.env.local`: `REDIS_URL=your-redis-url`

### Option B: Local Redis (Docker)
```bash
docker run --name masidy-redis -d -p 6379:6379 redis
# Add to .env.local: REDIS_URL=redis://localhost:6379
```

### Option C: Local Redis (Windows)
1. [Download Redis for Windows](https://github.com/microsoftarchive/redis/releases)
2. Install and start the service
3. Add to `.env.local`: `REDIS_URL=redis://localhost:6379`

## 3. Required API Keys

### AUTH_SECRET (Required)
```bash
# Generate a random secret (Windows PowerShell):
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 100000000 -Maximum 999999999).ToString()))

# Or use: https://generate-secret.vercel.app/32
```

### GROQ_API_KEY (Free - Highly Recommended)
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up (free)
3. Create API key
4. Add to `.env.local`: `GROQ_API_KEY=your-key`

### BLOB_READ_WRITE_TOKEN (Required for file uploads)
1. Go to [Vercel Blob](https://vercel.com/storage/blob)
2. Create a token
3. Add to `.env.local`: `BLOB_READ_WRITE_TOKEN=your-token`

### Optional API Keys
- **LANGSEARCH_API_KEY**: Web search capability (get from https://langsearch.com)
- **OPENROUTER_API_KEY**: Additional AI models (get from https://openrouter.ai/keys)
- **V0_API_KEY**: UI generation (get from https://v0.dev/chat/settings/keys)
- **STRIPE_SECRET_KEY**: For billing (get from https://dashboard.stripe.com)

## 4. Environment Setup

1. Update `.env.local` with your credentials:
```bash
cd c:\Users\ragab\Desktop\masidy-bot\chatbot
# Edit .env.local with your actual values
```

2. Verify the required variables:
```
✓ AUTH_SECRET
✓ POSTGRES_URL
✓ REDIS_URL
✓ BLOB_READ_WRITE_TOKEN
✓ GROQ_API_KEY (or other AI provider)
```

## 5. Running the Development Server

### First Time Setup
```bash
cd c:\Users\ragab\Desktop\masidy-bot\chatbot

# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The app will be available at http://localhost:3000

### Development Workflow
```bash
# Start dev server with hot reload
pnpm dev

# In another terminal - run Drizzle Studio to view database
pnpm db:studio

# Generate database types after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push
```

## 6. Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to database
pnpm db:pull          # Pull existing database schema
pnpm db:studio        # Open Drizzle Studio (GUI)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:check         # Check for conflicts

# Code Quality
pnpm check            # Run ultracite checker
pnpm fix              # Auto-fix code issues

# Testing
pnpm test             # Run Playwright tests
```

## 7. Database Schema

The app uses these main tables:
- **User** — User accounts and authentication
- **Chat** — Conversations
- **Message_v2** — Chat messages with parts and attachments
- **Document** — Created artifacts (text, code, images, sheets)
- **Vote_v2** — User feedback on messages
- **Suggestion** — AI-generated edit suggestions
- **Stream** — Real-time response tracking

## 8. Troubleshooting

### "POSTGRES_URL not defined"
- Make sure `.env.local` exists in `chatbot/` directory
- Verify the connection string is correct
- Test the connection: `psql <POSTGRES_URL>`

### "Cannot connect to Redis"
- Ensure Redis is running (`redis-cli ping` should return PONG)
- Check `REDIS_URL` in `.env.local`
- Try restarting the Redis service

### "Command not found" errors
- Make sure you're in the correct directory: `cd chatbot/`
- Run `pnpm install` to ensure all dependencies are installed
- Try clearing pnpm cache: `pnpm store prune`

### AI models not responding
- Verify API keys in `.env.local`
- Check rate limits on API provider websites
- Test API connectivity from the terminal

## 9. Quick Start (Minimal Setup)

If you want to run without databases initially:

1. Create `.env.local`:
```
AUTH_SECRET=dev-secret-change-in-prod
POSTGRES_URL=postgresql://user:pass@localhost:5432/masidy
REDIS_URL=redis://localhost:6379
BLOB_READ_WRITE_TOKEN=dev-token
GROQ_API_KEY=your-groq-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. Start dev server:
```bash
cd chatbot
pnpm install
pnpm dev
```

The server will warn about missing database, but you can still explore the UI.

## 10. Production Deployment

For Vercel deployment:
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

See [Vercel Documentation](https://vercel.com/docs) for details.

---

**Need help?** Check the main README.md or the codebase structure in `/lib` and `/app`.
