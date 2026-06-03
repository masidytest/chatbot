import { getRelevantSnippetsForQuestion } from "@/lib/rag";

export type Intent =
  | "greeting"
  | "definition"
  | "comparison"
  | "steps"
  | "analysis"
  | "image_generation"
  | "weather"
  | "currency"
  | "webpage_summary"
  | "dictionary"
  | "qr_code"
  | "chart"
  | "stock"
  | "news"
  | "general";

type Depth = "shallow" | "medium" | "deep";
type Length = "short" | "medium" | "long";

export interface MasidyMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PipelineResult {
  context: string;
  imageUrl?: string;
  intent: Intent;
}

// ── Intent detection ─────────────────────────────────────────────────────────
export function understand(question: string): {
  intent: Intent;
  depth: Depth;
  length: Length;
} {
  const q = question.toLowerCase().trim();

  // Greetings
  const greetings = ["hi", "hello", "hey", "مرحبا", "السلام", "هلا", "أهلا", "سلام"];
  if (greetings.some((g) => q === g || q.startsWith(`${g} `) || q.startsWith(`${g}!`))) {
    return { intent: "greeting", depth: "shallow", length: "short" };
  }

  // Image generation
  if (q.match(/\b(generate|create|draw|make|paint|design|show me|صور|ارسم|اصنع)\b.*\b(image|picture|photo|illustration|art|صورة|رسم)\b/) ||
      q.match(/\b(image|picture|photo)\b.*\b(of|for|showing)\b/) ||
      q.startsWith("generate image") || q.startsWith("create image") || q.startsWith("draw ")) {
    return { intent: "image_generation", depth: "shallow", length: "short" };
  }

  // Weather
  if (q.match(/\b(weather|temperature|forecast|rain|sunny|humid|طقس|درجة الحرارة|مناخ)\b/)) {
    return { intent: "weather", depth: "shallow", length: "short" };
  }

  // Currency
  if (q.match(/\b(currency|exchange rate|convert|usd|eur|gbp|jpy|dollar|euro|pound|عملة|سعر الصرف|تحويل)\b/)) {
    return { intent: "currency", depth: "shallow", length: "short" };
  }

  // Webpage summary
  if (q.match(/https?:\/\/[^\s]+/) || q.match(/\b(summarize|summary|read|fetch|open)\b.*\b(url|link|website|page|site)\b/)) {
    return { intent: "webpage_summary", depth: "medium", length: "medium" };
  }

  // YouTube — API is broken, fall through to web search which will find info about the video
  if (q.match(/youtube\.com|youtu\.be/) || q.match(/\b(youtube|video|transcript|summarize.*video|video.*summary)\b/)) {
    return { intent: "webpage_summary", depth: "medium", length: "medium" };
  }

  // Stock prices
  if (q.match(/\b(stock|share|price|ticker|trading|market|nasdaq|nyse|crypto|bitcoin|ethereum|btc|eth)\b/) ||
      q.match(/\b(AAPL|TSLA|MSFT|GOOGL|AMZN|META|NVDA|AMD)\b/i)) {
    return { intent: "stock", depth: "shallow", length: "short" };
  }

  // News
  if (q.match(/\b(news|headlines|latest|breaking|today.*news|recent.*news)\b/)) {
    return { intent: "news", depth: "shallow", length: "medium" };
  }

  // Dictionary
  if (q.match(/\b(define|definition|meaning|synonym|antonym|translate|معنى|تعريف|ترجمة)\b/)) {
    return { intent: "dictionary", depth: "shallow", length: "short" };
  }

  // QR code
  if (q.match(/\b(qr|qr code|barcode)\b/)) {
    return { intent: "qr_code", depth: "shallow", length: "short" };
  }

  // Chart
  if (q.match(/\b(chart|graph|plot|visualize|diagram|رسم بياني)\b/)) {
    return { intent: "chart", depth: "shallow", length: "short" };
  }

  // Standard intents
  let intent: Intent = "general";
  if (q.match(/\b(what is|what are|ما هو|ماهي|تعريف)\b/)) intent = "definition";
  else if (q.match(/\b(difference|vs|compare|versus|الفرق بين|مقارنة)\b/)) intent = "comparison";
  else if (q.match(/\b(how to|how do|كيف|طريقة|خطوات)\b/)) intent = "steps";
  else if (q.match(/\b(why|لماذا|سبب|أسباب)\b/)) intent = "analysis";

  let depth: Depth = "medium";
  if (q.match(/\b(briefly|short|باختصار|مختصر)\b/)) depth = "shallow";
  if (q.match(/\b(detail|explain|تفصيلي|تحليل)\b/)) depth = "deep";

  let length: Length = "medium";
  if (q.match(/\b(briefly|short|باختصار|مختصر)\b/)) length = "short";
  if (q.match(/\b(essay|report|بحث|تقرير)\b/)) length = "long";

  return { intent, depth, length };
}

// ── Tool: Image generation (Pollinations.ai — free with Referer header) ─────
async function generateImage(prompt: string): Promise<{ imageUrl: string; context: string }> {
  const encoded = encodeURIComponent(prompt);
  // Pollinations requires Referer header to work without API key
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}`;

  // Verify the image actually generates (Pollinations needs Referer)
  try {
    const res = await fetch(imageUrl, {
      headers: { Referer: "https://masidy.com" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return {
        imageUrl: "",
        context: `Image generation is temporarily unavailable. Please try again later.`,
      };
    }
  } catch {
    // Non-fatal — return the URL anyway, browser may still load it
  }

  return {
    imageUrl,
    context: `[Image generated for: "${prompt}"]\nImage URL: ${imageUrl}`,
  };
}

// ── Tool: Weather (Open-Meteo — free, no key) ────────────────────────────────
async function getWeatherData(query: string): Promise<string[]> {
  try {
    // Extract city from query
    const cityMatch = query.match(/(?:weather|forecast|temperature)\s+(?:in|at|for)?\s+([a-zA-Z\s]+)/i) ||
                      query.match(/([a-zA-Z\s]+)\s+(?:weather|forecast|temperature)/i);
    const city = cityMatch?.[1]?.trim() ?? query.replace(/weather|forecast|temperature|طقس|درجة الحرارة/gi, "").trim();

    if (!city) return [];

    // Geocode
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    const loc = geoData.results?.[0];
    if (!loc) return [`Could not find weather data for "${city}".`];

    // Weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!weatherRes.ok) return [];
    const w = await weatherRes.json();
    const c = w.current;

    const weatherCodes: Record<number, string> = {
      0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
      45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 61: "Light rain",
      63: "Moderate rain", 65: "Heavy rain", 71: "Light snow", 80: "Rain showers",
      95: "Thunderstorm",
    };
    const condition = weatherCodes[c.weather_code] ?? "Unknown";

    return [`[Weather: ${loc.name}, ${loc.country}]\nCondition: ${condition}\nTemperature: ${c.temperature_2m}°C\nHumidity: ${c.relative_humidity_2m}%\nWind: ${c.wind_speed_10m} km/h`];
  } catch {
    return [];
  }
}

// ── Tool: Currency exchange (exchangerate-api — free) ────────────────────────
async function getCurrencyData(query: string): Promise<string[]> {
  try {
    const match = query.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]{3})\s*(?:to|in|=)\s*([a-zA-Z]{3})/i);
    const from = match?.[2]?.toUpperCase() ?? "USD";
    const to = match?.[3]?.toUpperCase() ?? "EUR";
    const amount = parseFloat(match?.[1] ?? "1");

    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const rate = data.rates?.[to];
    if (!rate) return [`Could not find exchange rate for ${from} to ${to}.`];

    const converted = (amount * rate).toFixed(2);
    return [`[Currency Exchange]\n${amount} ${from} = ${converted} ${to}\nRate: 1 ${from} = ${rate.toFixed(4)} ${to}\nUpdated: ${data.date}`];
  } catch {
    return [];
  }
}

// ── Tool: YouTube transcript — REMOVED: YouTube timedtext API no longer works
// YouTube transcripts require authentication now. Removed to avoid false promises.

// ── Tool: Stock prices (Yahoo Finance — free, no key) ────────────────────────
async function getStockPrice(query: string): Promise<string[]> {
  try {
    // Extract ticker symbol — match patterns like "AAPL", "TSLA price", "what is MSFT stock"
    const tickerMatch = query.match(
      /\b([A-Z]{1,5})\b(?=\s*(?:stock|price|share|trading|worth|$))/i
    ) ?? query.match(/\b([A-Z]{2,5})\b/);
    
    let ticker = tickerMatch?.[1]?.toUpperCase();

    // Map common names to tickers
    const nameToTicker: Record<string, string> = {
      apple: "AAPL", microsoft: "MSFT", google: "GOOGL", alphabet: "GOOGL",
      amazon: "AMZN", tesla: "TSLA", meta: "META", facebook: "META",
      netflix: "NFLX", nvidia: "NVDA", amd: "AMD", intel: "INTC",
      bitcoin: "BTC-USD", ethereum: "ETH-USD", btc: "BTC-USD", eth: "ETH-USD",
    };
    const lower = query.toLowerCase();
    for (const [name, symbol] of Object.entries(nameToTicker)) {
      if (lower.includes(name)) { ticker = symbol; break; }
    }

    if (!ticker) return [];

    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return [];

    const json = await res.json() as {
      chart?: {
        result?: Array<{
          meta?: {
            symbol?: string;
            regularMarketPrice?: number;
            previousClose?: number;
            currency?: string;
            exchangeName?: string;
            longName?: string;
            regularMarketVolume?: number;
            fiftyTwoWeekHigh?: number;
            fiftyTwoWeekLow?: number;
          };
        }>;
        error?: unknown;
      };
    };

    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return [];

    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.previousClose ?? price;
    const change = price - prev;
    const changePct = prev > 0 ? ((change / prev) * 100).toFixed(2) : "0.00";
    const direction = change >= 0 ? "▲" : "▼";
    const currency = meta.currency ?? "USD";
    const name = meta.longName ?? meta.symbol ?? ticker;

    return [
      `[Stock: ${meta.symbol ?? ticker} — ${name}]
Exchange: ${meta.exchangeName ?? "N/A"}
Price: ${price.toFixed(2)} ${currency} ${direction} ${Math.abs(change).toFixed(2)} (${changePct}%)
Previous Close: ${prev.toFixed(2)} ${currency}
52-Week High: ${meta.fiftyTwoWeekHigh?.toFixed(2) ?? "N/A"} | Low: ${meta.fiftyTwoWeekLow?.toFixed(2) ?? "N/A"}
Volume: ${meta.regularMarketVolume?.toLocaleString() ?? "N/A"}`,
    ];
  } catch {
    return [];
  }
}

// ── Tool: News (NewsAPI — free tier, 100 req/day) ─────────────────────────────
async function getLatestNews(query: string): Promise<string[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    // Extract topic from query
    const topic = query
      .replace(/\b(latest|news|headlines|today|recent|about|on)\b/gi, "")
      .trim() || "technology";

    if (apiKey) {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=5&sortBy=publishedAt&language=en`,
        {
          headers: { "X-Api-Key": apiKey },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (res.ok) {
        const data = await res.json() as {
          articles?: Array<{ title?: string; description?: string; source?: { name?: string }; publishedAt?: string }>;
        };
        const articles = data?.articles ?? [];
        if (articles.length > 0) {
          const formatted = articles
            .slice(0, 5)
            .map(
              (a) =>
                `• ${a.title ?? "No title"} (${a.source?.name ?? "Unknown"}, ${
                  a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "today"
                })\n  ${a.description ?? ""}`
            )
            .join("\n\n");
          return [`[Latest News: ${topic}]\n${formatted}`];
        }
      }
    }

    // Fallback: DuckDuckGo news (no key needed)
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(`${topic} news`)}&format=json&no_html=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
      AbstractText?: string;
    };
    const topics = data?.RelatedTopics?.slice(0, 5) ?? [];
    if (topics.length > 0) {
      return [
        `[News: ${topic}]\n${topics
          .filter((t) => t.Text)
          .map((t) => `• ${t.Text}`)
          .join("\n")}`,
      ];
    }
    return [];
  } catch {
    return [];
  }
}

// ── Tool: Webpage summary ────────────────────────────────────────────────────
async function summarizeWebpage(query: string): Promise<string[]> {
  try {
    const urlMatch = query.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return [];
    const url = urlMatch[0];

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    // Extract text content (basic)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);

    return [`[Webpage: ${url}]\n${text}`];
  } catch {
    return [];
  }
}

// ── Tool: Dictionary (Free Dictionary API) ───────────────────────────────────
async function getDictionaryData(query: string): Promise<string[]> {
  try {
    const word = query.replace(/\b(define|definition|meaning|what does|mean|معنى|تعريف)\b/gi, "").trim().split(" ")[0];
    if (!word) return [];

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const entry = data[0];
    if (!entry) return [];

    const meanings = entry.meanings?.slice(0, 2).map((m: { partOfSpeech: string; definitions: { definition: string }[] }) =>
      `${m.partOfSpeech}: ${m.definitions[0]?.definition}`
    ).join("\n");

    return [`[Dictionary: ${entry.word}]\nPhonetic: ${entry.phonetic ?? "N/A"}\n${meanings}`];
  } catch {
    return [];
  }
}

// ── Tool: QR Code (goqr.me — free) ───────────────────────────────────────────
async function generateQRCode(query: string): Promise<{ imageUrl: string; context: string }> {
  const content = query.replace(/\b(qr|qr code|generate|create|make)\b/gi, "").trim();
  const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`;
  return {
    imageUrl,
    context: `[QR Code generated for: "${content}"]\nImage URL: ${imageUrl}`,
  };
}

// ── Tool: Chart (QuickChart.io — free) ───────────────────────────────────────
function generateChartUrl(query: string): string {
  // Simple bar chart example
  const config = {
    type: "bar",
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [{ label: "Data", data: [10, 20, 15, 25], backgroundColor: "#F97316" }],
    },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=600&height=400`;
}

// ── Tool: LangSearch ─────────────────────────────────────────────────────────
async function searchLangSearch(query: string): Promise<string[]> {
  const apiKey = process.env.LANGSEARCH_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.langsearch.com/v1/web-search", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, freshness: "noLimit", summary: true, count: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.data?.webPages?.value ?? [];
    return results
      .filter((r: { summary?: string; snippet?: string }) => r.summary || r.snippet)
      .slice(0, 3)
      .map((r: { name?: string; summary?: string; snippet?: string }) =>
        `[${r.name || "Web"}]\n${r.summary || r.snippet}`
      );
  } catch { return []; }
}

// ── Tool: Wikipedia ───────────────────────────────────────────────────────────
async function searchWikipedia(query: string): Promise<string[]> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const results = searchData?.query?.search ?? [];
    const snippets: string[] = [];
    for (const result of results.slice(0, 2)) {
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!summaryRes.ok) continue;
      const s = await summaryRes.json();
      if (s.extract) snippets.push(`[Wikipedia: ${result.title}]\n${s.extract}`);
    }
    return snippets;
  } catch { return []; }
}

// ── Tool: DuckDuckGo ──────────────────────────────────────────────────────────
async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const snippets: string[] = [];
    if (data.AbstractText) snippets.push(`[${data.AbstractSource || "DuckDuckGo"}]\n${data.AbstractText}`);
    if (data.Answer) snippets.push(`[Instant Answer]\n${data.Answer}`);
    if (data.Definition) snippets.push(`[Definition]\n${data.Definition}`);
    return snippets;
  } catch { return []; }
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
export async function runMasidyPipeline(
  messages: MasidyMessage[],
  userId?: string
): Promise<PipelineResult> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (!last) return { context: "", intent: "general" };

  const { intent, depth, length } = understand(last);

  // ── Image generation
  if (intent === "image_generation") {
    const prompt = last.replace(/\b(generate|create|draw|make|paint|design|show me|صور|ارسم|اصنع)\b/gi, "").replace(/\b(image|picture|photo|illustration|art|صورة|رسم)\b/gi, "").trim();
    const result = await generateImage(prompt || last);
    return { context: result.context, imageUrl: result.imageUrl, intent };
  }

  // ── QR code
  if (intent === "qr_code") {
    const result = await generateQRCode(last);
    return { context: result.context, imageUrl: result.imageUrl, intent };
  }

  // ── Weather
  if (intent === "weather") {
    const data = await getWeatherData(last);
    return { context: data.join("\n\n"), intent };
  }

  // ── Currency
  if (intent === "currency") {
    const data = await getCurrencyData(last);
    return { context: data.join("\n\n"), intent };
  }

  // ── Webpage summary
  if (intent === "webpage_summary") {
    const data = await summarizeWebpage(last);
    return { context: data.join("\n\n"), intent };
  }

  // ── Dictionary
  if (intent === "dictionary") {
    const data = await getDictionaryData(last);
    if (data.length > 0) return { context: data.join("\n\n"), intent };
  }

  // ── YouTube summary — removed (API no longer works)
  // Falls through to webpage_summary intent above

  // ── Stock prices
  if (intent === "stock") {
    const data = await getStockPrice(last);
    if (data.length > 0) return { context: data.join("\n\n"), intent };
  }

  // ── News
  if (intent === "news") {
    const data = await getLatestNews(last);
    if (data.length > 0) return { context: data.join("\n\n"), intent };
  }

  // ── Greeting
  if (intent === "greeting") return { context: "", intent };

  // ── RAG (user documents first)
  const ragSnippets = await getRelevantSnippetsForQuestion(last, userId);
  if (ragSnippets.length > 0) return { context: ragSnippets.join("\n\n"), intent };

  // ── LangSearch (primary web search)
  const langResults = await searchLangSearch(last);
  if (langResults.length > 0) {
    return { context: buildContext(langResults, depth, length, last), intent };
  }

  // ── Fallback: Wikipedia + DuckDuckGo
  const [wikiSnippets, ddgSnippets] = await Promise.all([
    searchWikipedia(last),
    searchDuckDuckGo(last),
  ]);
  const combined = [...ddgSnippets, ...wikiSnippets].slice(0, 4);
  return { context: buildContext(combined, depth, length, last), intent };
}

function buildContext(sources: string[], depth: Depth, length: Length, question: string): string {
  if (sources.length === 0) return "";
  const depthNote = depth === "shallow" ? "Keep the answer brief." : depth === "deep" ? "Give a detailed explanation." : "";
  const lengthNote = length === "short" ? "Be concise." : length === "long" ? "Be comprehensive." : "";
  const hasArabic = /[\u0600-\u06FF]/.test(question);
  const hasChinese = /[\u4E00-\u9FFF]/.test(question);
  const hasRussian = /[\u0400-\u04FF]/.test(question);
  const langHint = hasArabic ? "Respond in Arabic." : hasChinese ? "Respond in Chinese." : hasRussian ? "Respond in Russian." : "";
  const instructions = [depthNote, lengthNote, langHint].filter(Boolean).join(" ");
  return `Retrieved context (use this to answer accurately):\n\n${sources.join("\n\n")}${instructions ? `\n\nInstructions: ${instructions}` : ""}`;
}
