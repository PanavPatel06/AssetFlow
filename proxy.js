import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// This Next.js version renamed `middleware.js` to `proxy.js` (same
// config.matcher API) — see node_modules/next/dist/docs/.../file-conventions/proxy.md.
const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
