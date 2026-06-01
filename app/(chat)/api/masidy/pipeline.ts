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
  | "youtube_summary"
  | "dictionary"
  | "qr_code"
  | "chart"
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

  // YouTube
  if (q.match(/youtube\.com|youtu\.be/) || q.match(/\b(youtube|video|transcript|summarize.*video)\b/)) {
    return { intent: "youtube_summary", depth: "medium", length: "medium" };
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

// ── Tool: Image generation (Pollinations.ai — free, no key) ─────────────────
async function generateImage(prompt: string): Promise<{ imageUrl: string; context: string }> {
  const encoded = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true`;
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
