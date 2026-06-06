import { tool } from "ai";
import { z } from "zod";

export const getDictionary = tool({
  description: "Look up word definitions, meanings, and phonetics.",
  inputSchema: z.object({
    word: z.string().describe("The word to look up"),
  }),
  execute: async (input) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(input.word.trim())}`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) {
        return { error: `Word "${input.word}" not found in dictionary` };
      }

      const data = await response.json();
      const entry = Array.isArray(data) ? data[0] : data;

      if (!entry) {
        return { error: `No definition found for "${input.word}"` };
      }

      const meanings = entry.meanings
        ?.slice(0, 2)
        .map(
          (m: { partOfSpeech?: string; definitions?: Array<{ definition?: string }> }) =>
            `**${m.partOfSpeech || "Unknown"}**: ${m.definitions?.[0]?.definition || "No definition"}`
        )
        .join("\n");

      return {
        word: entry.word,
        phonetic: entry.phonetic || "N/A",
        meanings: meanings || "No meanings found",
      };
    } catch (error) {
      return {
        error: "Failed to fetch definition. Please try again.",
      };
    }
  },
});
