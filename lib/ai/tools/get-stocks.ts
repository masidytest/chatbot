import { tool } from "ai";
import { z } from "zod";

export const getStocks = tool({
  description: "Get real-time stock and crypto prices from financial markets.",
  inputSchema: z.object({
    ticker: z
      .string()
      .describe("Stock ticker symbol (e.g., AAPL, TSLA) or crypto (e.g., BTC-USD, ETH-USD)"),
  }),
  execute: async (input) => {
    try {
      let ticker = input.ticker.toUpperCase().trim();

      // Map common names to tickers
      const nameToTicker: Record<string, string> = {
        apple: "AAPL",
        microsoft: "MSFT",
        google: "GOOGL",
        alphabet: "GOOGL",
        amazon: "AMZN",
        tesla: "TSLA",
        meta: "META",
        facebook: "META",
        netflix: "NFLX",
        nvidia: "NVDA",
        amd: "AMD",
        intel: "INTC",
        bitcoin: "BTC-USD",
        ethereum: "ETH-USD",
        btc: "BTC-USD",
        eth: "ETH-USD",
      };

      const lower = ticker.toLowerCase();
      if (lower in nameToTicker) {
        ticker = nameToTicker[lower];
      }

      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
        {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (!response.ok) {
        return { error: `Could not find ticker "${ticker}"` };
      }

      const json = (await response.json()) as {
        chart?: {
          result?: Array<{
            meta?: {
              symbol?: string;
              regularMarketPrice?: number;
              currency?: string;
            };
            timestamp?: number[];
            indicators?: {
              quote?: Array<{
                high?: number[];
                low?: number[];
                close?: number[];
              }>;
            };
          }>;
        };
      };

      const result = json.chart?.result?.[0];
      if (!result) {
        return { error: `Could not find data for ticker "${ticker}"` };
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      const close = quote?.close ?? [];
      const current = close[close.length - 1] ?? meta?.regularMarketPrice;

      if (!current) {
        return { error: `No price data available for "${ticker}"` };
      }

      return {
        ticker: meta?.symbol || ticker,
        price: current.toFixed(2),
        currency: meta?.currency || "USD",
        high: (quote?.high?.[0] || current).toFixed(2),
        low: (quote?.low?.[0] || current).toFixed(2),
      };
    } catch (error) {
      return {
        error: "Failed to fetch stock data. Please try again.",
      };
    }
  },
});
