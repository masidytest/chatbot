import { tool } from "ai";
import { z } from "zod";

export const summarizeWebpage = tool({
  description: "Fetch and summarize the content of a webpage by URL.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the webpage to summarize"),
  }),
  execute: async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return {
          error: `Failed to fetch page (HTTP ${response.status})`,
        };
      }

      const html = await response.text();

      // Extract text content (basic cleanup)
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove styles
        .replace(/<[^>]+>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Collapse whitespace
        .trim()
        .slice(0, 3000); // First 3000 chars

      if (!text) {
        return {
          error: "Could not extract text from webpage",
        };
      }

      return {
        url: input.url,
        content: text,
        length: text.length,
        message: `Successfully summarized webpage (${text.length} characters)`,
      };
    } catch (error) {
      return {
        error: `Failed to fetch webpage: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
