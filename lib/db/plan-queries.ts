import "server-only";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { document } from "./schema";
import { generateUUID } from "../utils";
import type { UserPlan } from "../ai/tiers";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

const PLAN_KEY = "__plan__current";

/** Get the user's current plan. Defaults to "free". */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  try {
    const rows = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, userId),
          like(document.title, PLAN_KEY)
        )
      )
      .orderBy(desc(document.createdAt))
      .limit(1);

    const plan = rows[0]?.content;
    if (plan === "plus" || plan === "pro") return plan;
    return "free";
  } catch {
    return "free";
  }
}

/** Set the user's plan (called after Stripe webhook confirms payment). */
export async function setUserPlan(userId: string, plan: UserPlan) {
  try {
    const existing = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, userId),
          like(document.title, PLAN_KEY)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(document)
        .set({ content: plan })
        .where(
          and(
            eq(document.userId, userId),
            like(document.title, PLAN_KEY)
          )
        );
    } else {
      await db.insert(document).values({
        id: generateUUID(),
        title: PLAN_KEY,
        content: plan,
        kind: "text",
        userId,
        createdAt: new Date(),
      });
    }
  } catch {
    // non-fatal
  }
}
