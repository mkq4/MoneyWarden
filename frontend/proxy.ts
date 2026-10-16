import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const ACCESS_COOKIE = "access_token";
/** Не-httpOnly маркер «есть смысл пробовать refresh», ставится бэкендом вместе с токенами. */
const SESSION_COOKIE = "session";
const PUBLIC_PAGES = ["/login"];

let secret: Uint8Array | undefined;

/** Тот же секрет, которым бэкенд подписывает access-токены. Без него не пускаем никого. */
function getSecret(): Uint8Array {
  if (secret) return secret;
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value) throw new Error("JWT_ACCESS_SECRET не задан: proxy не может проверить сессию");
  secret = new TextEncoder().encode(value);
  return secret;
}

/** Подпись и срок access-токена; в БД не ходим. */
async function hasValidAccess(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // API бэкенда отдаём с того же origin — куки авторизации становятся first-party.
  if (pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(pathname + search, API_URL));
  }

  const isPublic = PUBLIC_PAGES.includes(pathname);

  if (await hasValidAccess(request)) {
    return isPublic ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  // Access протух или подделан, но сессия, похоже, была: обновляем токены на бэкенде
  // (refresh-кука видна только на /api/auth). Не вышло — бэкенд сотрёт куки и вернёт на /login.
  if (request.cookies.has(SESSION_COOKIE)) {
    const refresh = new URL("/api/auth/refresh", request.url);
    refresh.searchParams.set("next", isPublic ? "/" : pathname + search);
    return NextResponse.redirect(refresh);
  }

  return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Всё, кроме статики Next и файлов из public.
  matcher: ["/((?!_next/|icons/|icon.png|apple-icon.png|logo.png|favicon.ico|manifest.webmanifest).*)"],
};
