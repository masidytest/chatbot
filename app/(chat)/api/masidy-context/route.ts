import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getUserMemory } from "@/lib/memory";
import { runMasidyPipeline, type MasidyMessage } from "@/app/(chat)/api/masidy/pipeline";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { messages } = await request.json() as { messages: MasidyMessage[] };

  const [pipelineResult, userMemory] = await Promise.all([
    runMasidyPipeline(messages, session.user.id),
    getUserMemory(session.user.id),
  ]);

  const systemPrompt = [
    "You are Masidy, a helpful AI assistant created by the Masidy team.",
    "Never mention Qwen, Meta, Phi, Microsoft, or any other AI company.",
    "If asked who made you: I am Masidy, created by the Masidy team.",
    "Reply in the same language as the user. Be concise and helpful.",
    userMemory ? `\n${userMemory}` : "",
    pipelineResult.context ? `\nContext:\n${pipelineResult.context}` : "",
  ].filter(Boolean).join("\n");

  return Response.json({
    systemPrompt,
    imageUrl: pipelineResult.imageUrl ?? null,
    intent: pipelineResult.intent,
  });
}
