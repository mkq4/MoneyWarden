const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_PREPOSITIONAL = [
  "январе", "феврале", "марте", "апреле", "мае", "июне",
  "июле", "августе", "сентябре", "октябре", "ноябре", "декабре",
];
const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** '2025-04' → «Апрель 2025» */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** '2026-09' → «сентябре» (+ год, если не текущий) */
export function formatMonthPrepositional(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const name = MONTHS_PREPOSITIONAL[m - 1];
  return y === new Date().getFullYear() ? name : `${name} ${y}`;
}

/** '2025-04' → «апр» */
export function formatMonthShort(month: string): string {
  return MONTHS_SHORT[Number(month.split("-")[1]) - 1];
}

/** Локальная дата в YYYY-MM-DD */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const currentMonth = (): string => toISODate(new Date()).slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  return toISODate(new Date(y, m - 1 + delta, 1)).slice(0, 7);
}

/** '2025-04-12' → «Сегодня» / «Вчера» / «12 апреля» / «12 апреля 2024» */
export function formatDay(date: string): string {
  const today = new Date();
  if (date === toISODate(today)) return "Сегодня";
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date === toISODate(yesterday)) return "Вчера";
  const [y, m, d] = date.split("-").map(Number);
  const base = `${d} ${MONTHS_GENITIVE[m - 1]}`;
  return y === today.getFullYear() ? base : `${base} ${y}`;
}

/**
 * Подпись времени операции: «Сегодня, 10:24». Время берём из createdAt,
 * только если операцию записали в тот же день, на который она датирована.
 */
export function formatWhen(date: string, createdAt: string): string {
  const created = new Date(createdAt);
  const day = formatDay(date);
  if (toISODate(created) !== date) return day;
  const time = created.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${time}`;
}

/** «12 апр» для подписей осей */
export function formatDayShort(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}
