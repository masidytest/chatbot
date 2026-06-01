/**
 * RAG (Retrieval Augmented Generation) for Masidy.
 * Searches documents saved by the user (uploaded files) for relevant content.
 */
import { getDocumentsByUserId } from "./db/rag-queries";

// Simple keyword-based relevance scoring
function scoreRelevance(text: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const textLower = text.toLowerCase();
  let score = 0;
  for (const word of queryWords) {
    const count = (textLower.match(new RegExp(word, "g")) ?? []).length;
    score += count;
  }
  return score;
}

// Extract the most relevant chunk from a document
function extractRelevantChunk(content: string, query: string, maxLength = 800): string {
  const sentences = content.split(/[.!?]\s+/);
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  // Score each sentence
  const scored = sentences.map((s, i) => ({
    text: s,
    index: i,
    score: queryWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Take top sentences and reconstruct
  const topSentences = scored.slice(0, 5).sort((a, b) => a.index - b.index);
  const chunk = topSentences.map((s) => s.text).join(". ");

  return chunk.length > maxLength ? chunk.slice(0, maxLength) + "..." : chunk;
}

export async function getRelevantSnippetsForQuestion(
  question: string,
  userId?: string
): Promise<string[]> {
  if (!userId) return [];

  try {
    const documents = await getDocumentsByUserId({ userId });
    if (!documents || documents.length === 0) return [];

    // Score all documents
    const scored = documents
      .filter((doc) => doc.content && doc.content.length > 50)
      .map((doc) => ({
        doc,
        score: scoreRelevance(doc.content ?? "", question),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2); // top 2 most relevant docs

    return scored.map(({ doc }) => {
      const chunk = extractRelevantChunk(doc.content ?? "", question);
      return `[From your document: "${doc.title}"]\n${chunk}`;
    });
  } catch {
    return [];
  }
}
