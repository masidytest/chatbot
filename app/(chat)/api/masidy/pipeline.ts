import { getRelevantSnippetsForQuestion } from "@/lib/rag";

type Intent = "definition" | "comparison" | "steps" | "analysis" | "greeting" | "general";
type Depth = "shallow" | "medium" | "deep";
type Length = "short" | "medium" | "long";

export interface MasidyMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function understand(question: string): {
  intent: Intent;
  depth: Depth;
  length: Length;
} {
  const q = question.toLowerCase().trim();

  const greetings = ["hi", "hello", "hey", "مرحبا", "السلام", "هلا", "أهلا", "سلام"];
  if (greetings.some((g) => q === g || q.startsWith(g + " ") || q.startsWith(g + "!"))) {
    return { intent: "greeting", depth: "shallow", length: "short" };
  }

  let intent: Intent = "general";
  if (q.includes("what is") || q.includes("what are") || q.includes("ما هو") || q.includes("ماهي") || q.includes("تعريف")) {
    intent = "definition";
  } else if (q.includes("difference") || q.includes("vs") || q.includes("compare") || q.includes("الفرق بين") || q.includes("مقارنة")) {
    intent = "comparison";
  } else if (q.includes("how to") || q.includes("how do") || q.includes("كيف") || q.includes("طريقة") || q.includes("خطوات")) {
    intent = "steps";
  } else if (q.includes("why") || q.includes("لماذا") || q.includes("سبب") || q.includes("أسباب")) {
    intent = "analysis";
  }

  let depth: Depth = "medium";
  if (q.includes("briefly") || q.includes("short") || q.includes("باختصار") || q.includes("مختصر")) depth = "shallow";
  if (q.includes("detail") || q.includes("explain") || q.includes("تفصيلي") || q.includes("تحليل")) depth = "deep";

  let length: Length = "medium";
  if (q.includes("briefly") || q.includes("short") || q.includes("باختصار") || q.includes("مختصر")) length = "short";
  if (q.includes("essay") || q.includes("report") || q.includes("بحث") || q.includes("تقرير")) length = "long";

  return { intent, depth, length };
}

// ── Source 1: LangSearch (free, AI-optimized web search) ────────────────────
async function searchLangSearch(query: string): Promise<string[]> {
  const apiKey = process.env.LANGSEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.langsearch.com/v1/web-search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        freshness: "noLimit",
        summary: true,
        count: 5,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.data?.webPages?.value ?? [];

    return results
      .filter((r: { name?: string; summary?: string; snippet?: string }) => r.summary || r.snippet)
      .slice(0, 3)
      .map((r: { name?: string; summary?: string; snippet?: string }) =>
        `[${r.name || "Web"}]\n${r.summary || r.snippet}`
      );
  } catch {
    return [];
  }
}
async function searchWikipedia(query: string): Promise<string[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2&origin=*`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const results = searchData?.query?.search ?? [];
    if (results.length === 0) return [];

    const snippets: string[] = [];
    for (const result of results.slice(0, 2)) {
      const title = encodeURIComponent(result.title);
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
      const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(5000) });
      if (!summaryRes.ok) continue;
      const summaryData = await summaryRes.json();
      if (summaryData.extract) {
        snippets.push(`[Wikipedia: ${result.title}]\n${summaryData.extract}`);
      }
    }
    return snippets;
  } catch {
    return [];
  }
}

// ── Source 2: DuckDuckGo Instant Answer (free, no key) ──────────────────────
async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const data = await res.json();
    const snippets: string[] = [];

    // Abstract (main answer)
    if (data.AbstractText) {
      snippets.push(`[${data.AbstractSource || "DuckDuckGo"}]\n${data.AbstractText}`);
    }

    // Answer (instant fact)
    if (data.Answer) {
      snippets.push(`[Instant Answer]\n${data.Answer}`);
    }

    // Definition
    if (data.Definition) {
      snippets.push(`[Definition: ${data.DefinitionSource || ""}]\n${data.Definition}`);
    }

    // Related topics (top 2)
    if (data.RelatedTopics?.length > 0) {
      const topics = data.RelatedTopics
        .filter((t: { Text?: string }) => t.Text)
        .slice(0, 2)
        .map((t: { Text: string }) => t.Text);
      if (topics.length > 0) {
        snippets.push(`[Related]\n${topics.join("\n")}`);
      }
    }

    return snippets;
  } catch {
    return [];
  }
}

// ── Source 3: Wikidata (free, structured facts) ──────────────────────────────
async function searchWikidata(query: string): Promise<string[]> {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1&origin=*`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.search ?? [];
    if (results.length === 0) return [];

    const top = results[0];
    const snippets: string[] = [];

    if (top.label && top.description) {
      snippets.push(`[Wikidata: ${top.label}]\n${top.description}`);
    }

    return snippets;
  } catch {
    return [];
  }
}

// ── Main retrieval: LangSearch first, Wikipedia + DDG as fallback ────────────
async function retrieve(question: string, intent: Intent, userId?: string): Promise<string[]> {
  if (intent === "greeting") return [];

  // RAG first (user documents)
  const ragSnippets = await getRelevantSnippetsForQuestion(question, userId);
  if (ragSnippets.length > 0) return ragSnippets;

  // LangSearch — best quality, AI-optimized
  const langResults = await searchLangSearch(question);
  if (langResults.length > 0) return langResults;

  // Fallback: Wikipedia + DuckDuckGo + Wikidata in parallel
  const [wikiSnippets, ddgSnippets, wikidataSnippets] = await Promise.all([
    searchWikipedia(question),
    searchDuckDuckGo(question),
    searchWikidata(question),
  ]);

  const combined = [...ddgSnippets, ...wikiSnippets, ...wikidataSnippets];
  return combined.slice(0, 4);
}

export async function runMasidyPipeline(
  messages: MasidyMessage[],
  userId?: string
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (!last) return "";

  const { intent, depth, length } = understand(last);
  const sources = await retrieve(last, intent, userId);

  if (sources.length === 0) return "";

  const depthNote = depth === "shallow" ? "Keep the answer brief." : depth === "deep" ? "Give a detailed explanation." : "";
  const lengthNote = length === "short" ? "Be concise." : length === "long" ? "Be comprehensive." : "";

  // Detect language hint for the LLM
  const hasArabic = /[\u0600-\u06FF]/.test(last);
  const hasChinese = /[\u4E00-\u9FFF]/.test(last);
  const hasRussian = /[\u0400-\u04FF]/.test(last);
  const langHint = hasArabic ? "Respond in Arabic." :
    hasChinese ? "Respond in Chinese." :
    hasRussian ? "Respond in Russian." : "";

  const instructions = [depthNote, lengthNote, langHint].filter(Boolean).join(" ");

  return `Retrieved context (use this to answer accurately):\n\n${sources.join("\n\n")}${instructions ? `\n\nInstructions: ${instructions}` : ""}`;
}
