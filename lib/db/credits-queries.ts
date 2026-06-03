import "server-only";
import { and, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { document } from "./schema";
import { generateUUID } from "../utils";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

const CREDITS_KEY = "__credits__balance";

/** Get the user's current credit balance. */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const rows = await db
      .select()
      .from(document)
      .where(and(eq(document.userId, userId), like(document.title, CREDITS_KEY)))
      .limit(1);
    const val = Number(rows[0]?.content ?? "0");
    return Number.isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

/** Add credits to a user (subscription renewal or top-up). */
export async function addUserCredits(userId: string, amount: number) {
  try {
    const current = await getUserCredits(userId);
    const newBalance = current + amount;
    await _setCredits(userId, newBalance);
    return newBalance;
  } catch {
    return 0;
  }
}

/** Deduct credits from a user. Returns false if not enough credits. */
export async function deductUserCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    const current = await getUserCredits(userId);
    if (current < amount) return false;
    await _setCredits(userId, current - amount);
    return true;
  } catch {
    return false;
  }
}

async function _setCredits(userId: string, balance: number) {
  const rows = await db
    .select()
    .from(document)
    .where(and(eq(document.userId, userId), like(document.title, CREDITS_KEY)))
    .limit(1);

  if (rows.length > 0) {
    await db
      .update(document)
      .set({ content: String(balance) })
      .where(and(eq(document.userId, userId), like(document.title, CREDITS_KEY)));
  } else {
    await db.insert(document).values({
      id: generateUUID(),
      title: CREDITS_KEY,
      content: String(balance),
      kind: "text",
      userId,
      createdAt: new Date(),
    });
  }
}
