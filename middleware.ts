import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Belt-and-suspenders: never touch Next internals (HMR, manifests, fallback chunks, etc.).
  if (pathname.startsWith("/_next/") || pathname.startsWith("/__nextjs")) {
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (error) {
    console.error("[middleware] updateSession failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Exclude all of /_next/* (not only /_next/static), so dev-only paths like
     * webpack-hmr never run Supabase session logic — avoids intermittent 500s and
     * "Cannot find the middleware module" after HMR.
     */
    "/((?!api|_next|favicon\\.ico|_vercel).*)",
  ],
};
