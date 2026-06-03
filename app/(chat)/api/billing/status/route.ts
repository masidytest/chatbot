import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getUserCredits } from "@/lib/db/credits-queries";
import { getUserPlan } from "@/lib/db/plan-queries";
import { creditsByPlan, planNames } from "@/lib/ai/tiers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const [plan, credits] = await Promise.all([
    getUserPlan(session.user.id),
    getUserCredits(session.user.id),
  ]);

  return Response.json({
    plan,
    planName: planNames[plan],
    credits,
    monthlyCredits: creditsByPlan[plan],
  });
}
