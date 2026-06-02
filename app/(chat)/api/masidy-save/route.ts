import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { saveChat, saveMessages, getChatById, updateChatTitleById } from "@/lib/db/queries";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { generateUUID } from "@/lib/utils";
import type { UIMessage } from "ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { chatId, userMessage, assistantText, visibility } = await request.json() as {
    chatId: string;
    userMessage: { id: string; content: string };
    assistantText: string;
    visibility: "public" | "private";
  };

  const existing = await getChatById({ id: chatId });

  if (!existing) {
    await saveChat({
      id: chatId,
      userId: session.user.id,
      title: "New chat",
      visibility,
    });

    // Generate title async
    generateTitleFromUserMessage({
      message: { id: userMessage.id, role: "user", parts: [{ type: "text", text: userMessage.content }] } as UIMessage,
    }).then((title) => {
      updateChatTitleById({ chatId, title }).catch(() => {});
    }).catch(() => {});
  }

  const assistantId = generateUUID();

  await saveMessages({
    messages: [
      {
        id: userMessage.id,
        chatId,
        role: "user",
        parts: [{ type: "text", text: userMessage.content }],
        attachments: [],
        createdAt: new Date(),
      },
      {
        id: assistantId,
        chatId,
        role: "assistant",
        parts: [{ type: "text", text: assistantText }],
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  return Response.json({ success: true, assistantId });
}
