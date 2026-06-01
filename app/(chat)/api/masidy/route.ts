import type { NextRequest } from "next/server";
import { runMasidyPipeline, type MasidyMessage } from "./pipeline";

interface ChatRequestBody {
  messages: MasidyMessage[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequestBody;
  const messages = body.messages ?? [];

  if (!messages.length || !messages[messages.length - 1]?.content) {
    return new Response("No message provided.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const answer = await runMasidyPipeline(messages);

  return new Response(answer, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
