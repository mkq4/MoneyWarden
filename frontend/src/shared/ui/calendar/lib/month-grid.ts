import { toISODate } from "@/shared/lib/format";

/** Шесть недель (42 дня) с понедельника, покрывающие месяц 'YYYY-MM'. */
export function monthGrid(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7; // понедельник = 0
  return Array.from({ length: 42 }, (_, i) => toISODate(new Date(y, m - 1, 1 - offset + i)));
}
