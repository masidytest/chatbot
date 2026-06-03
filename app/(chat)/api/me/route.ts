import { auth } from "@/app/(auth)/auth";
import { guestRegex } from "@/lib/constants";
import { getUserMemory } from "@/lib/memory";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ name: null, isGuest: true });
  }

  const email = session.user.email ?? "";
  const isGuest = guestRegex.test(email);

  if (isGuest) {
    return Response.json({ name: null, isGuest: true });
  }

  // Check memory for a saved name first
  let name: string | null = null;
  try {
    const memory = await getUserMemory(session.user.id);
    const nameMatch = memory.match(/^name:\s*(.+)$/m) ?? memory.match(/^name_ar:\s*(.+)$/m);
    if (nameMatch?.[1]) {
      name = nameMatch[1].trim();
    }
  } catch {
    // fallback to email
  }

  // Fall back to email prefix, capitalize it
  if (!name) {
    const prefix = email.split("@")[0] ?? "";
    // Remove numbers and special chars, capitalize first letter
    name = prefix.replace(/[^a-zA-Z\s]/g, "").trim();
    if (name) {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    } else {
      name = null;
    }
  }

  return Response.json({ name, isGuest: false });
}
