"use client";

import { useSession } from "next-auth/react";

// Thin wrapper around the real Auth.js session. Kept as its own module (same
// name/shape as the Phase 1 mock) so every existing `useCurrentUser().user`
// call site — id/name/role — keeps working unchanged.
export function useCurrentUser() {
  const { data: session } = useSession();
  return { user: session?.user };
}
