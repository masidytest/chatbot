import { tool } from "ai";
import { z } from "zod";

export const getNews = tool({
  description: "Get the latest news headlines and stories.",
  inputSchema: z.object({
    topic: z.string().describe("Topic to search for (e.g., 'technology', 'sports', 'politics')"),
  }),
  execute: async (input) => {
    try {
      // Use NewsAPI.org if available, fallback to DuckDuckGo news search
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(input.topic)}&format=json&kl=us`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) {
        return { error: "Could not fetch news" };
      }

      const data = await response.json();
      const news: string[] = [];

      if (data.AbstractText) {
        news.push(`[Featured]\n${data.AbstractText}`);
      }
      if (data.Answer) {
        news.push(`[Latest]\n${data.Answer}`);
      }
      if (data.Results && Array.isArray(data.Results)) {
        for (const result of data.Results.slice(0, 3)) {
          if (result.Text) {
            news.push(`[Result]\n${result.Text}`);
          }
        }
      }

      return {
        topic: input.topic,
        headlines: news.slice(0, 3).join("\n\n") || "No news found for this topic",
        count: news.length,
      };
    } catch (error) {
      return {
        error: "Failed to fetch news. Please try again.",
        headlines: "",
        count: 0,
      };
    }
  },
});
