import { ROUTES } from "@/shared/config";
import { currentMonth } from "@/shared/lib/format";

/** Ссылка на историю за конкретный месяц (+ фильтры); текущий месяц — без ?m. */
export function historyHref(month: string, extra: Record<string, string> = {}): string {
  const search = new URLSearchParams(extra);
  if (month !== currentMonth()) search.set("m", month);
  const str = search.toString();
  return str ? `${ROUTES.history}?${str}` : ROUTES.history;
}
