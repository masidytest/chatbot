import { tool } from "ai";
import { z } from "zod";

export const webSearch = tool({
  description: "Search the web for current information. Uses multiple sources for reliable results.",
  inputSchema: z.object({
    query: z.string().describe("What to search for on the web"),
  }),
  execute: async (input) => {
    try {
      const results: string[] = [];

      // 1. Try LangSearch first (primary)
      try {
        const langRes = await fetch(
          `https://langsearch.com/api/search?q=${encodeURIComponent(input.query)}&count=3`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (langRes.ok) {
          const data = await langRes.json();
          if (data.results && Array.isArray(data.results)) {
            results.push(
              ...data.results
                .slice(0, 3)
                .map((r: { title?: string; description?: string; url?: string }) =>
                  `[${r.title || "Result"}]\n${r.description || ""}\nURL: ${r.url || ""}`
                )
            );
          }
        }
      } catch {
        // Continue to fallbacks
      }

      // 2. Fallback: Wikipedia
      if (results.length === 0) {
        try {
          const wikiRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(input.query)}&format=json&srlimit=2&origin=*`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (wikiRes.ok) {
            const data = await wikiRes.json();
            const wikiResults = data?.query?.search ?? [];
            for (const result of wikiResults.slice(0, 2)) {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`,
                { signal: AbortSignal.timeout(5000) }
              );
              if (summaryRes.ok) {
                const s = await summaryRes.json();
                if (s.extract) results.push(`[Wikipedia: ${result.title}]\n${s.extract}`);
              }
            }
          }
        } catch {
          // Continue to DuckDuckGo
        }
      }

      // 3. Fallback: DuckDuckGo
      if (results.length === 0) {
        try {
          const ddgRes = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json&no_html=1&skip_disambig=1`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (ddgRes.ok) {
            const data = await ddgRes.json();
            if (data.AbstractText) results.push(`[${data.AbstractSource || "DuckDuckGo"}]\n${data.AbstractText}`);
            if (data.Answer) results.push(`[Instant Answer]\n${data.Answer}`);
            if (data.Definition) results.push(`[Definition]\n${data.Definition}`);
          }
        } catch {
          // All failed
        }
      }

      return {
        results: results.slice(0, 3).join("\n\n"),
        count: results.length,
      };
    } catch (error) {
      return {
        error: "Web search failed. Please try again.",
        results: "",
        count: 0,
      };
    }
  },
});
