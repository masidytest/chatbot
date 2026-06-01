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

// Wikipedia API — free, no key needed
async function searchWikipedia(query: string): Promise<string[]> {
  try {
    // Search for the most relevant article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2&origin=*`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const results = searchData?.query?.search ?? [];
    if (results.length === 0) return [];

    // Fetch summary for top result
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

async function retrieve(question: string, intent: Intent): Promise<string[]> {
  // Skip retrieval for greetings and conversational messages
  if (intent === "greeting") return [];

  // Try RAG first (user documents)
  const ragSnippets = await getRelevantSnippetsForQuestion(question);
  if (ragSnippets.length > 0) return ragSnippets;

  // Fall back to Wikipedia for factual questions
  const wikiSnippets = await searchWikipedia(question);
  return wikiSnippets;
}

export async function runMasidyPipeline(
  messages: MasidyMessage[]
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (!last) return "";

  const { intent, depth, length } = understand(last);
  const sources = await retrieve(last, intent);

  if (sources.length === 0) return "";

  // Return sources as context for the LLM — it will synthesize the final answer
  const depthNote = depth === "shallow" ? "Keep the answer brief." : depth === "deep" ? "Give a detailed explanation." : "";
  const lengthNote = length === "short" ? "Be concise." : length === "long" ? "Be comprehensive." : "";

  return `Retrieved context (use this to answer accurately):\n\n${sources.join("\n\n")}${depthNote || lengthNote ? `\n\nInstructions: ${depthNote} ${lengthNote}`.trim() : ""}`;
}
