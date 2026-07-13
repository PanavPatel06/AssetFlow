import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can } from "@/lib/roles";

// Shared guards for API route handlers. Usage:
//
//   const { user, error } = await requireUser();
//   if (error) return error;
//
//   const { user, error } = await requireCapability("registerAsset");
//   if (error) return error;

export async function getSessionUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function requireCapability(capability) {
  const { user, error } = await requireUser();
  if (error) return { user: null, error };

  if (!can(user.role, capability)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
