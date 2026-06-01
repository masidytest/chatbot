/**
 * RAG (Retrieval Augmented Generation) helper for Masidy.
 *
 * Currently a stub — returns empty results.
 * Future: query the Document table using embeddings + similarity search,
 * so Masidy can answer questions about uploaded files and saved documents.
 */
export async function getRelevantSnippetsForQuestion(
  _question: string
): Promise<string[]> {
  // TODO:
  // 1. Embed the question using an embedding model
  // 2. Query the Document table (or a vector DB) for similar chunks
  // 3. Return the top-N most relevant text snippets
  return [];
}
