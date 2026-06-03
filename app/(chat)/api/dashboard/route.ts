import "server-only";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { document, chat } from "@/lib/db/schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const userId = session.user.id;

  try {
    const docs = await db
      .select()
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt))
      .limit(100);

    // Memories use __memory__ prefix, plan uses __plan__, credits use __credits__
    const memories = docs
      .filter((d) => d.title?.startsWith("__memory__"))
      .map((d) => ({
        key: d.title.replace("__memory__", ""),
        value: d.content ?? "",
      }));

    const documents = docs
      .filter((d) => !d.title?.startsWith("__") )
      .map((d) => ({
        id: d.id,
        title: d.title,
        kind: d.kind,
      }));

    const chats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId))
      .limit(500);

    return Response.json({
      chatCount: chats.length,
      memories,
      documents,
    });
  } catch {
    return Response.json({ chatCount: 0, memories: [], documents: [] });
  }
}
