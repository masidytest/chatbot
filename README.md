# Masidy

Masidy is a personal AI system built on Next.js with a custom reasoning pipeline, real-time web search, document analysis, memory, and voice.

## Features

- **Real-time web search** — LangSearch + Wikipedia + DuckDuckGo + Wikidata
- **Document analysis** — Upload PDF, TXT, MD files and ask questions about them
- **Memory** — Remembers facts about you across conversations
- **Voice input** — Speak your messages using the mic button
- **Voice output** — Listen to responses with the speaker button
- **Multilingual** — Auto-detects and responds in your language
- **6 AI models** — Masidy, Flash, Code, Mini, Pro, Speed

## Models

| Model | Best for |
|---|---|
| Masidy | Custom pipeline with web search |
| Masidy Flash | Fast everyday questions |
| Masidy Code | Programming and technical tasks |
| Masidy Mini | Quick lightweight answers |
| Masidy Pro | Complex reasoning and research |
| Masidy Speed | Fastest responses |

## Running locally

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Required environment variables (see `.env.example`):
- `AUTH_SECRET`
- `POSTGRES_URL`
- `BLOB_READ_WRITE_TOKEN`
- `REDIS_URL`
- `NEXT_PUBLIC_BASE_URL`
- `LANGSEARCH_API_KEY`
