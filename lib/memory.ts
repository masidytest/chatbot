/**
 * Masidy Memory System
 * Stores and retrieves user facts across conversations.
 * Uses the existing Document table with a special "__memory__" title prefix.
 */
import "server-only";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { document } from "./db/schema";
import { generateUUID } from "./utils";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

const MEMORY_PREFIX = "__memory__";

// Patterns that indicate the user is sharing personal info
const MEMORY_PATTERNS = [
  { regex: /my name is ([A-Za-z\s]+)/i, key: "name" },
  { regex: /i(?:'m| am) ([A-Za-z\s]+) years old/i, key: "age" },
  { regex: /i(?:'m| am) from ([A-Za-z\s,]+)/i, key: "location" },
  { regex: /i(?:'m| am) a ([A-Za-z\s]+)/i, key: "profession" },
  { regex: /i work (?:at|for|as) ([A-Za-z\s]+)/i, key: "work" },
  { regex: /i(?:'m| am) learning ([A-Za-z\s]+)/i, key: "learning" },
  { regex: /i like ([A-Za-z\s,]+)/i, key: "interests" },
  { regex: /i love ([A-Za-z\s,]+)/i, key: "loves" },
  { regex: /remember that ([^.!?]+)/i, key: "note" },
  { regex: /اسمي ([^\s.!?]+)/i, key: "name_ar" },
  { regex: /أنا من ([^\s.!?]+)/i, key: "location_ar" },
];

export function extractMemoryFacts(text: string): { key: string; value: string }[] {
  const facts: { key: string; value: string }[] = [];
  for (const pattern of MEMORY_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match?.[1]) {
      facts.push({ key: pattern.key, value: match[1].trim() });
    }
  }
  return facts;
}

export async function saveMemoryFact(userId: string, key: string, value: string) {
  try {
    // Check if this key already exists and update it
    const existing = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, userId),
          like(document.title, `${MEMORY_PREFIX}${key}`)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing memory
      await db
        .update(document)
        .set({ content: value })
        .where(
          and(
            eq(document.userId, userId),
            like(document.title, `${MEMORY_PREFIX}${key}`)
          )
        );
    } else {
      // Insert new memory
      await db.insert(document).values({
        id: generateUUID(),
        title: `${MEMORY_PREFIX}${key}`,
        content: value,
        kind: "text",
        userId,
        createdAt: new Date(),
      });
    }
  } catch {
    // Non-fatal
  }
}

export async function getUserMemory(userId: string): Promise<string> {
  try {
    const memories = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, userId),
          like(document.title, `${MEMORY_PREFIX}%`)
        )
      )
      .orderBy(desc(document.createdAt))
      .limit(20);

    if (memories.length === 0) return "";

    const facts = memories
      .filter((m) => m.content)
      .map((m) => {
        const key = m.title.replace(MEMORY_PREFIX, "");
        return `${key}: ${m.content}`;
      });

    return facts.length > 0
      ? `What I know about you:\n${facts.join("\n")}`
      : "";
  } catch {
    return "";
  }
}
