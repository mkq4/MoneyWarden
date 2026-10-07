"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { currentMonth } from "@/shared/lib/format";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Выбранный месяц живёт в ?m=YYYY-MM — переживает переходы и перезагрузку. */
export function useMonth(): [string, (month: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  // null бывает только в Pages Router; в App Router значения есть всегда.
  const pathname = usePathname() ?? "/";
  const raw = params?.get("m") ?? null;
  const month = raw && MONTH_RE.test(raw) ? raw : currentMonth();

  const setMonth = useCallback(
    (next: string) => {
      const search = new URLSearchParams(params?.toString());
      if (next === currentMonth()) search.delete("m");
      else search.set("m", next);
      const str = search.toString();
      router.replace(str ? `${pathname}?${str}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return [month, setMonth];
}

/** Ссылка на другую страницу с сохранением выбранного месяца (+ доп. параметры). */
export function useHrefWithMonth() {
  const params = useSearchParams();
  const m = params?.get("m");
  return (path: string, extra: Record<string, string> = {}) => {
    const search = new URLSearchParams(extra);
    if (m) search.set("m", m);
    const str = search.toString();
    return str ? `${path}?${str}` : path;
  };
}
