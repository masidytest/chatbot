# Masidy Chatbot - Project Summary

## What is Masidy?

A full-featured AI chatbot platform built with modern web technologies. It's like having a personal AI assistant with superpowers:

- 🤖 Multiple AI models (Groq, OpenAI, OpenRouter)
- 🔍 Real-time web search capabilities
- 📄 Document analysis (upload PDFs, texts, markdown)
- 💭 Memory system (remembers facts across conversations)
- 🎤 Voice input/output
- 🌍 Multilingual support
- 📝 Document creation and editing
- 💳 Subscription billing (Free, Plus, Pro)

## Project Status

**✅ Fully Functional**
- All dependencies installed
- Development environment configured
- Ready for local development
- Database migrations pending (see setup)

## Quick Start (5 minutes)

1. **Configure Environment**
   ```bash
   # Edit .env.local with your API credentials
   # Minimum required:
   - AUTH_SECRET (generate: https://generate-secret.vercel.app/32)
   - POSTGRES_URL (Vercel Postgres or local DB)
   - REDIS_URL (Vercel Redis or local Redis)
   - BLOB_READ_WRITE_TOKEN (Vercel Blob)
   - GROQ_API_KEY (free from https://console.groq.com)
   ```

2. **Run Migrations**
   ```bash
   cd c:\Users\ragab\Desktop\masidy-bot\chatbot
   pnpm db:migrate
   ```

3. **Start Development**
   ```bash
   pnpm dev
   # → http://localhost:3000
   ```

## Technology Stack

**Frontend:**
- Next.js 16.2 (React 19)
- Tailwind CSS 4
- Framer Motion (animations)
- ProseMirror (rich editor)
- CodeMirror (code editor)
- Radix UI (components)

**Backend:**
- Node.js with Next.js API routes
- TypeScript
- Drizzle ORM

**Database:**
- PostgreSQL (main data)
- Redis (sessions & caching)
- Vercel Blob (file storage)

**AI & APIs:**
- Vercel AI SDK (unified LLM interface)
- Groq (free Llama 3.1 8B)
- OpenAI (GPT models)
- OpenRouter (various models)
- LangSearch (web search)
- FAL AI (image generation)
- Replicate (ML models)

**DevOps & Tools:**
- Vercel (hosting)
- Stripe (billing)
- Playwright (testing)
- Biome (code quality)
- Drizzle Kit (database management)

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Next.js App                   │
│  ┌──────────────────────────────────┐   │
│  │  Frontend (React 19)             │   │
│  │  - Chat UI                       │   │
│  │  - Document Editor (ProseMirror) │   │
│  │  - Settings & Auth               │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  API Routes (Backend)            │   │
│  │  - /api/chat        (Messages)   │   │
│  │  - /api/document    (Artifacts)  │   │
│  │  - /api/auth        (Auth)       │   │
│  │  - /api/billing     (Stripe)     │   │
│  │  - /api/masidy      (AI Engine)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│         External Services               │
│  ┌──────────────────────────────────┐   │
│  │  AI Providers                    │   │
│  │  - Groq (Llama 3.1)              │   │
│  │  - OpenAI (GPT)                  │   │
│  │  - OpenRouter                    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Data Services                   │   │
│  │  - PostgreSQL (Data)             │   │
│  │  - Redis (Cache)                 │   │
│  │  - Vercel Blob (Files)           │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Utilities                       │   │
│  │  - LangSearch (Web Search)       │   │
│  │  - Stripe (Billing)              │   │
│  │  - FAL AI (Images)               │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Data Models

### User
- Email/password authentication
- Subscription tier (Free/Plus/Pro)
- Profile (name, image)
- Anonymous guest support

### Chat
- Conversation container
- User ownership
- Public/private visibility
- Title & timestamps

### Message
- Parts-based structure (text, code, images)
- Attachments support
- Role (user/assistant/system)
- Metadata & creation time

### Document
- Artifacts created by AI
- Types: text, code, image, sheet
- Version tracking (created_at partition)
- Rich editing support

### Vote
- User feedback on messages
- Upvote/downvote tracking
- Used for model improvement

### Suggestion
- AI-generated edit suggestions
- Document changes tracking
- Resolution status
- User acceptance tracking

## API Endpoints

**Chat:**
- `POST /api/chat` — Send message
- `GET /api/chat/[id]/stream` — Stream response
- `DELETE /api/chat` — Delete chat

**Messages:**
- `GET /api/messages` — Get chat history
- `GET /api/suggestions` — AI suggestions

**Documents:**
- `POST /api/document` — Create artifact
- `POST /api/files/upload` — Upload file
- `GET /api/dashboard` — User dashboard

**Billing:**
- `POST /api/billing/checkout` — Stripe checkout
- `GET /api/billing/status` — Subscription status
- `POST /api/webhooks/stripe` — Webhook handler

**AI:**
- `POST /api/masidy` — Custom reasoning pipeline
- `POST /api/image/generate` — Image generation
- `POST /api/models` — List available models

**Auth:**
- `POST /api/auth/[...nextauth]` — NextAuth handlers
- `GET /api/auth/guest` — Anonymous login
- `GET /api/me` — Current user info

## Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables |
| `package.json` | Dependencies & scripts |
| `drizzle.config.ts` | Database configuration |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |

## Key Files

```
app/
  (auth)/               # Authentication routes
    login/              # Login page
    register/           # Registration page
    api/auth/           # Auth handlers
    auth.config.ts      # NextAuth configuration
    auth.ts             # Auth utilities
    
  (chat)/               # Main chat application
    page.tsx            # Home page
    chat/[id]/          # Chat page
    api/
      chat/             # Chat endpoints
      document/         # Document management
      files/upload/     # File upload
      image/generate/   # Image generation
      masidy/           # Custom AI pipeline
      billing/          # Stripe integration
      
lib/
  ai/
    models.ts           # AI model providers
    prompts.ts          # System prompts
    providers.ts        # Model configuration
    tools/              # AI tools (create doc, etc)
    
  db/
    schema.ts           # Drizzle ORM schema
    queries.ts          # Database queries
    migrate.ts          # Migration runner
    rag-queries.ts      # Document retrieval
    
  rag.ts               # Retrieval-augmented generation
  memory.ts            # Memory system
  ratelimit.ts         # Rate limiting
```

## Development Workflow

### First Time Setup
```bash
cd c:\Users\ragab\Desktop\masidy-bot\chatbot
pnpm install          # Install dependencies
pnpm db:migrate       # Create database schema
pnpm dev              # Start dev server
```

### Ongoing Development
```bash
pnpm dev              # Hot-reload development server
pnpm db:studio        # View/edit database (in separate terminal)
pnpm check            # Lint and check code
```

### Making Changes
```bash
# Modify database schema
# lib/db/schema.ts

# Then run:
pnpm db:generate      # Generate migration
pnpm db:migrate       # Apply migration
```

## Features Deep Dive

### 🤖 AI Models
- **Default:** Groq (free Llama 3.1 8B)
- **Alternative:** OpenAI, OpenRouter
- **Specialized models:**
  - Masidy Flash (fast)
  - Masidy Code (programming)
  - Masidy Mini (lightweight)
  - Masidy Pro (complex reasoning)

### 🔍 Web Search
- Real-time search via LangSearch
- Wikipedia integration
- DuckDuckGo integration
- Wikidata integration

### 📄 Document Analysis
- PDF file upload and parsing
- Text file support
- Markdown support
- RAG (Retrieval-Augmented Generation)
- Question answering on documents

### 💭 Memory System
- Remembers facts across conversations
- User-specific memory
- Persistent storage
- Context-aware responses

### 🎤 Voice I/O
- Microphone input for messages
- Text-to-speech output
- Browser-native Web APIs
- Fallback text mode

### 📝 Document Creation
- AI-generated text documents
- Code artifacts
- Image previews
- Spreadsheet data
- Rich editing with ProseMirror

## Deployment

**Development:**
```bash
pnpm dev
```

**Production Build:**
```bash
pnpm build
pnpm start
```

**Vercel Deployment:**
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Auto-deploy on push

## Monitoring & Debugging

```bash
# View logs
pnpm dev              # See errors in terminal

# Database inspection
pnpm db:studio        # GUI database browser

# Code quality
pnpm check            # Run ultracite linter
pnpm fix              # Auto-fix issues

# Testing
pnpm test             # Run Playwright tests
```

## Performance Optimizations

- Next.js Turbo (faster builds)
- React Compiler (automatic memoization)
- Vercel Edge Runtime (fast API routes)
- Redis caching
- Streaming responses
- Image optimization
- Code splitting

## Security

✅ **Implemented:**
- NextAuth with credentials provider
- Password hashing (bcrypt-ts)
- SQL injection prevention (Drizzle ORM)
- CSRF protection
- Rate limiting
- Environment variable isolation
- Server-side rendering (SSR)

## Team & Support

**Developed by:** Masidy Team
**License:** Check LICENSE file
**Status:** Active development

## Next Steps

1. Configure `.env.local` ← **Start here**
2. Run `pnpm db:migrate`
3. Run `pnpm dev`
4. Visit http://localhost:3000
5. Start building!

---

See `QUICK_START.md` for setup instructions or `SETUP_GUIDE.md` for detailed configuration.
