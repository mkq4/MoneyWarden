import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
/** Не-httpOnly маркер сессии, ставится бэкендом вместе с токенами. */
const SESSION_COOKIE = "session";
const PUBLIC_PAGES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // API бэкенда отдаём с того же origin — куки авторизации становятся first-party.
  if (pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(pathname + search, API_URL));
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PAGES.includes(pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Всё, кроме статики Next и файлов из public.
  matcher: ["/((?!_next/|icon.png|apple-icon.png|logo.png|favicon.ico).*)"],
};
