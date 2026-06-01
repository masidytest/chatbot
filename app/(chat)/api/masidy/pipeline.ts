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

  // Greetings — handle first so they get a clean reply
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

async function retrieve(question: string): Promise<string[]> {
  // RAG hook — returns real snippets when implemented
  const ragSnippets = await getRelevantSnippetsForQuestion(question);
  return ragSnippets;
}

function generateAnswer(
  question: string,
  intent: Intent,
  _depth: Depth,
  _length: Length,
  ragSnippets: string[]
): string {
  // Greeting — clean natural response
  if (intent === "greeting") {
    return "Hello! I'm Masidy, your AI assistant. How can I help you today?";
  }

  // If we have real RAG snippets, use them
  if (ragSnippets.length > 0) {
    return ragSnippets.join("\n\n");
  }

  // No real data yet — give a helpful honest response based on intent
  const topic = question.trim();

  if (intent === "definition") {
    return `I don't have real-time data yet to give you a precise definition of "${topic}". Once web search is connected to Masidy, I'll be able to retrieve accurate, up-to-date information. For now, try asking me something I can reason about directly.`;
  }

  if (intent === "comparison") {
    return `Comparing "${topic}" requires real-time data which Masidy's retrieval layer doesn't have yet. Once connected to live sources, I'll give you a detailed comparison. Stay tuned!`;
  }

  if (intent === "steps") {
    return `To explain how to "${topic}", I need access to real-time sources. Masidy's web retrieval is coming soon. For now, I can help you think through problems or answer questions based on reasoning.`;
  }

  if (intent === "analysis") {
    return `Analyzing "${topic}" deeply requires current data. Masidy's retrieval pipeline is a stub for now — real web search integration is the next step. I can still help you reason through ideas!`;
  }

  // General fallback — honest and clean
  return `You asked: "${topic}"\n\nMasidy is running but the retrieval layer is still a stub — real web search hasn't been connected yet. I understood your question and processed it through the pipeline (understanding → retrieval → summarization → fusion → generation), but I don't have live data to give you a real answer yet.\n\nOnce web search is integrated, I'll be able to answer any question with real, up-to-date information.`;
}

export async function runMasidyPipeline(
  messages: MasidyMessage[]
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  if (!last) return "No message provided.";

  const { intent, depth, length } = understand(last);
  const ragSnippets = await retrieve(last);

  return generateAnswer(last, intent, depth, length, ragSnippets);
}
