import "server-only";
import { and, desc, eq, like } from "drizzle-orm";
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
    // Get all user documents
    const docs = await db
      .select()
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt))
      .limit(50);

    // Separate memories from real documents
    const memories = docs
      .filter((d) => d.title?.startsWith("__memory__"))
      .map((d) => ({
        key: d.title.replace("__memory__", ""),
        value: d.content ?? "",
      }));

    const documents = docs
      .filter((d) => !d.title?.startsWith("__memory__"))
      .map((d) => ({
        id: d.id,
        title: d.title,
        kind: d.kind,
        createdAt: d.createdAt,
      }));

    // Get chat count
    const chats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId))
      .limit(200);

    return Response.json({
      chatCount: chats.length,
      memories,
      documents,
    });
  } catch {
    return Response.json({ chatCount: 0, memories: [], documents: [] });
  }
}
