import { ROUTES } from "@/shared/config";
import { arrayOf, isString, oneOf, optional, shape, type Guard } from "@/shared/lib/guards";
import type { ApiErrorBody, HttpMethod, OkResponse, RequestOptions } from "./http.interface";
import { buildQuery } from "./query-string";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const isApiErrorBody: Guard<ApiErrorBody> = shape<ApiErrorBody>({
  message: optional(oneOf(isString, arrayOf(isString))),
});

export const isOkResponse: Guard<OkResponse> = shape<OkResponse>({
  ok: (value): value is true => value === true,
});

let refreshing: Promise<boolean> | null = null;

/** Параллельные 401 ждут один и тот же refresh. */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

async function errorMessage(res: Response): Promise<string> {
  const body = await readJson(res);
  const fallback = `Ошибка ${res.status}`;
  if (!isApiErrorBody(body)) return fallback;
  const message = Array.isArray(body.message) ? body.message[0] : body.message;
  return message ?? fallback;
}

/** Полная перезагрузка: proxy перечитает куку сессии, кэш запросов сбросится. */
export function hardNavigate(path: string): void {
  window.location.href = path;
}

/**
 * Запрос к API бэкенда. Ответ проверяется guard'ом — в вызывающий код
 * попадают только данные ожидаемой формы.
 */
export async function request<TResponse, TBody = never>(
  method: HttpMethod,
  path: string,
  guard: Guard<TResponse>,
  { body, query }: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const hasBody = body !== undefined;
  const url = `/api${path}${query ? buildQuery(query) : ""}`;
  const doFetch = () =>
    fetch(url, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();
  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (await refreshSession()) {
      res = await doFetch();
    } else {
      hardNavigate(ROUTES.login);
      throw new ApiError(401, "Сессия истекла");
    }
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));

  const data = await readJson(res);
  if (!guard(data)) throw new ApiError(res.status, "Неожиданный ответ сервера");
  return data;
}


