import { getRelevantSnippetsForQuestion } from "@/lib/rag";

type Intent = "definition" | "comparison" | "steps" | "analysis" | "general";
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
  const q = question.toLowerCase();

  let intent: Intent = "general";
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

  let depth: Depth = "medium";
  if (q.includes("باختصار") || q.includes("مختصر")) depth = "shallow";
  if (q.includes("تفصيلي") || q.includes("تحليل")) depth = "deep";

  let length: Length = "medium";
  if (q.includes("باختصار") || q.includes("مختصر")) length = "short";
  if (q.includes("بحث") || q.includes("تقرير")) length = "long";

  return { intent, depth, length };
}

async function retrieve(question: string): Promise<string[]> {
  const base = [
    `Source 1: Basic explanation about "${question}".`,
    `Source 2: Additional context related to "${question}".`,
  ];
  const ragSnippets = await getRelevantSnippetsForQuestion(question);
  return [...ragSnippets, ...base];
}

function summarize(source: string, intent: Intent): string {
  if (intent === "definition") return `تعريف مبسّط: ${source}`;
  if (intent === "comparison") return `نقطة مقارنة: ${source}`;
  if (intent === "steps") return `خطوة محتملة: ${source}`;
  if (intent === "analysis") return `تحليل مبدئي: ${source}`;
  return `ملخص: ${source}`;
}

function fuse(
  summaries: string[],
  _intent: Intent,
  depth: Depth,
  length: Length
): string[] {
  let lines = summaries;
  if (depth === "shallow") lines = lines.slice(0, 2);
  else if (depth === "medium") lines = lines.slice(0, 4);
  if (length === "short") lines = lines.slice(0, 3);
  else if (length === "medium") lines = lines.slice(0, 6);
  return lines;
}

function generateAnswer(
  points: string[],
  intent: Intent,
  depth: Depth,
  length: Length
): string {
  const header = "إجابة Masidy:\n\n";
  const body = points.map((p) => `- ${p}`).join("\n");
  const footer = `\n\n(نمط: ${intent} — عمق: ${depth} — طول: ${length})`;
  return header + body + footer;
}

export async function runMasidyPipeline(
  messages: MasidyMessage[]
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (!last) return "No message provided.";

  const { intent, depth, length } = understand(last);
  const sources = await retrieve(last);
  const summaries = sources.map((s) => summarize(s, intent));
  const fused = fuse(summaries, intent, depth, length);
  return generateAnswer(fused, intent, depth, length);
}
