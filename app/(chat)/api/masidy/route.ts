import type { NextRequest } from "next/server";
import { getRelevantSnippetsForQuestion } from "@/lib/rag";

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

interface ChatRequestBody {
  messages: Message[];
}

function understand(question: string) {
  const q = question.toLowerCase();

  let intent = "general";
  if (
    q.includes("what is") ||
    q.includes("ما هو") ||
    q.includes("ماهي") ||
    q.includes("تعريف")
  ) {
    intent = "definition";
  } else if (
    q.includes("difference") ||
    q.includes("الفرق بين") ||
    q.includes("مقارنة")
  ) {
    intent = "comparison";
  } else if (
    q.includes("how") ||
    q.includes("كيف") ||
    q.includes("طريقة") ||
    q.includes("خطوات")
  ) {
    intent = "steps";
  } else if (
    q.includes("why") ||
    q.includes("لماذا") ||
    q.includes("سبب") ||
    q.includes("أسباب")
  ) {
    intent = "analysis";
  }

  let depth: "shallow" | "medium" | "deep" = "medium";
  if (q.includes("باختصار") || q.includes("مختصر")) depth = "shallow";
  if (q.includes("تفصيلي") || q.includes("تحليل")) depth = "deep";

  let length: "short" | "medium" | "long" = "medium";
  if (q.includes("باختصار") || q.includes("مختصر")) length = "short";
  if (q.includes("بحث") || q.includes("تقرير")) length = "long";

  return { intent, depth, length };
}

// Retrieval: stub sources + RAG hook (returns real snippets when implemented).
async function retrieve(question: string): Promise<string[]> {
  const base = [
    `Source 1: Basic explanation about "${question}".`,
    `Source 2: Additional context related to "${question}".`,
  ];

  // RAG hook — currently returns [] but will return real document snippets later.
  const ragSnippets = await getRelevantSnippetsForQuestion(question);

  return [...ragSnippets, ...base];
}

function summarize(source: string, intent: string): string {
  // Very simple summarization stub.
  if (intent === "definition") {
    return `تعريف مبسّط: ${source}`;
  }
  if (intent === "comparison") {
    return `نقطة مقارنة: ${source}`;
  }
  if (intent === "steps") {
    return `خطوة محتملة: ${source}`;
  }
  if (intent === "analysis") {
    return `تحليل مبدئي: ${source}`;
  }
  return `ملخص: ${source}`;
}

function fuse(
  summaries: string[],
  intent: string,
  depth: string,
  length: string
): string[] {
  let lines = summaries;

  if (depth === "shallow") {
    lines = lines.slice(0, 2);
  } else if (depth === "medium") {
    lines = lines.slice(0, 4);
  }

  if (length === "short") {
    lines = lines.slice(0, 3);
  } else if (length === "medium") {
    lines = lines.slice(0, 6);
  }

  return lines;
}

function generateAnswer(
  points: string[],
  intent: string,
  depth: string,
  length: string
): string {
  const header = "إجابة Masidy:\n\n";
  const body = points.map((p) => `- ${p}`).join("\n");
  const footer = `\n\n(نمط: ${intent} — عمق: ${depth} — طول: ${length})`;
  return header + body + footer;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequestBody;
  const messages = body.messages ?? [];
  const last = messages[messages.length - 1]?.content ?? "";

  if (!last) {
    return new Response("No message provided.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 1) Understanding
  const { intent, depth, length } = understand(last);

  // 2) Retrieval (stub + RAG hook)
  const sources = await retrieve(last);

  // 3) Summarization
  const summaries = sources.map((s) => summarize(s, intent));

  // 4) Fusion
  const fused = fuse(summaries, intent, depth, length);

  // 5) Generation
  const answer = generateAnswer(fused, intent, depth, length);

  return new Response(answer, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
