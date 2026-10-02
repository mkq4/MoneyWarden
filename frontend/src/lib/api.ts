export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

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

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return msg ?? `Ошибка ${res.status}`;
  } catch {
    return `Ошибка ${res.status}`;
  }
}

export async function api<T>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const doFetch = () =>
    fetch(`/api${path}`, {
      ...init,
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

  let res = await doFetch();
  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (await refreshSession()) {
      res = await doFetch();
    } else {
      // Полная перезагрузка: proxy перечитает куку сессии, кэш запросов сбросится.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
      throw new ApiError(401, "Сессия истекла");
    }
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  return (await res.json()) as T;
}

/** Собирает query-строку, пропуская пустые значения. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
