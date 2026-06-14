# Masidy Setup Checklist

Use this checklist to verify your local development environment is ready.

## ✅ Part 1: Project Basics

- [x] Project cloned/downloaded
- [x] Dependencies installed (`pnpm install`)
- [x] `.env.local` created
- [ ] **You:** Read QUICK_START.md

## ✅ Part 2: Environment Variables

### Required Variables (Must Have)

#### Authentication
- [ ] `AUTH_SECRET` 
  - Generate: https://generate-secret.vercel.app/32
  - Or Windows PowerShell: `[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random).ToString()))`

#### Database & Cache
- [ ] `POSTGRES_URL`
  - Option A: Vercel PostgreSQL (recommended)
  - Option B: Docker Postgres
  - Option C: Local PostgreSQL install
  - Example: `postgresql://user:pass@localhost:5432/masidy`

- [ ] `REDIS_URL`
  - Option A: Vercel Redis
  - Option B: Docker Redis
  - Option C: Local Redis install
  - Example: `redis://localhost:6379`

#### File Storage
- [ ] `BLOB_READ_WRITE_TOKEN`
  - Get from: https://vercel.com/storage/blob
  - Required for file uploads

#### Base URL
- [ ] `NEXT_PUBLIC_BASE_URL`
  - For local dev: `http://localhost:3000`
  - For production: Your domain

#### AI Provider (Pick One)
- [ ] `GROQ_API_KEY` (FREE - Recommended)
  - Get from: https://console.groq.com/keys
  - Free tier available
  - Powers Llama 3.1 8B model

### Optional Variables (Nice to Have)

- [ ] `LANGSEARCH_API_KEY` (Web search)
  - Get from: https://langsearch.com
  - Enables real-time web search

- [ ] `OPENROUTER_API_KEY` (Alternative models)
  - Get from: https://openrouter.ai/keys
  - Adds more AI model options

- [ ] `V0_API_KEY` (UI generation)
  - Get from: https://v0.dev/chat/settings/keys
  - For component generation

- [ ] `STRIPE_*` (Billing)
  - For payment processing
  - Test mode keys from: https://dashboard.stripe.com

### Verify Configuration
```bash
# Check .env.local exists
cd c:\Users\ragab\Desktop\masidy-bot\chatbot
cat .env.local
```

## ✅ Part 3: Database Setup

### Choose Your Database Option

#### Option A: Vercel PostgreSQL + Vercel Redis (EASIEST)
- [ ] Create Vercel account: https://vercel.com
- [ ] Create PostgreSQL database
- [ ] Create Redis database
- [ ] Copy connection strings to `.env.local`
- [ ] Skip to Part 4

#### Option B: Docker (LOCAL)
- [ ] Install Docker: https://www.docker.com/products/docker-desktop
- [ ] Run PostgreSQL:
  ```bash
  docker run --name masidy-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
  ```
- [ ] Run Redis:
  ```bash
  docker run --name masidy-redis -d -p 6379:6379 redis
  ```
- [ ] Add to `.env.local`:
  ```
  POSTGRES_URL=postgresql://postgres:password@localhost:5432/postgres
  REDIS_URL=redis://localhost:6379
  ```

#### Option C: Local Install (WINDOWS)
- [ ] Install PostgreSQL: https://www.postgresql.org/download/windows/
- [ ] Install Redis: https://github.com/microsoftarchive/redis/releases
- [ ] Start PostgreSQL service
- [ ] Start Redis service
- [ ] Update `.env.local` with local credentials

## ✅ Part 4: Run Migrations

```bash
cd c:\Users\ragab\Desktop\masidy-bot\chatbot
pnpm db:migrate
```

Expected output:
```
Running migrations...
Migrations completed in XXXms
```

**Issues?**
- [ ] Verify `POSTGRES_URL` is correct
- [ ] Ensure PostgreSQL is running
- [ ] Check firewall/network connectivity

## ✅ Part 5: Start Development Server

```bash
pnpm dev
```

Expected output:
```
▲ Next.js 16.2.0
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 2.5s
```

**Issues?**
- [ ] Port 3000 already in use? Change: `pnpm dev -- -p 3001`
- [ ] Dependencies not installed? Run: `pnpm install`
- [ ] TypeScript errors? Run: `pnpm check` to see details

## ✅ Part 6: Verify Installation

Open http://localhost:3000 in your browser:

- [ ] Page loads without errors
- [ ] Can see login/register pages
- [ ] No console errors (open DevTools: F12)

**Quick Test:**
1. Create an account
2. Send a message
3. Should get response from AI

## ✅ Part 7: Optional - Database GUI

In a new terminal:
```bash
pnpm db:studio
```

- [ ] Drizzle Studio opens (usually http://localhost:5555)
- [ ] Can see database tables (User, Chat, Message, etc.)
- [ ] Can browse/inspect data

## 🔍 Troubleshooting

### Problem: "POSTGRES_URL not defined"
- [ ] Check `.env.local` exists
- [ ] Verify `POSTGRES_URL` line is present
- [ ] No extra spaces around `=`

### Problem: "Cannot connect to Redis"
- [ ] Ensure Redis is running
- [ ] Check `REDIS_URL` format
- [ ] Test: `redis-cli ping` (should return PONG)

### Problem: "Port 3000 already in use"
```bash
# Option A: Use different port
pnpm dev -- -p 3001

# Option B: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process-id> /F
```

### Problem: Dependencies/install errors
```bash
# Clear cache and reinstall
pnpm store prune
pnpm install
```

### Problem: TypeScript errors
```bash
# Verify no syntax issues
pnpm check

# Type-check everything
tsc --noEmit
```

## 📋 Final Checklist

Before you start developing:

- [ ] `.env.local` configured with all required variables
- [ ] Database running and accessible
- [ ] `pnpm db:migrate` succeeded without errors
- [ ] `pnpm dev` started successfully
- [ ] http://localhost:3000 loads without errors
- [ ] Can see login page
- [ ] Browser console has no critical errors

## 🚀 You're Ready!

Once all checkboxes are complete, you can:

```bash
# Development workflow
pnpm dev              # Start dev server

# In another terminal
pnpm db:studio        # View database (optional)

# Code quality
pnpm check            # Check for issues
pnpm fix              # Auto-fix issues

# Testing
pnpm test             # Run tests
```

## 📚 Next Resources

- `QUICK_START.md` — Quick reference guide
- `SETUP_GUIDE.md` — Detailed setup instructions
- `PROJECT_SUMMARY.md` — Project overview
- README.md — Feature documentation

## 💬 Common Commands

```bash
# Start server
pnpm dev

# Build for production
pnpm build
pnpm start

# Database operations
pnpm db:migrate       # Run migrations
pnpm db:studio        # GUI browser
pnpm db:generate      # Generate migration
pnpm db:push          # Push schema to DB
pnpm db:pull          # Pull schema from DB

# Code quality
pnpm check            # Lint
pnpm fix              # Auto-fix

# Testing
pnpm test             # Run Playwright tests
```

---

**Still stuck?** Check the specific setup guide for your database option or reach out to the team.

Good luck! 🎉
