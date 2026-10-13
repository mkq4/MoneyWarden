import { daysUntil, pluralize } from "@/shared/lib/format";

/** «завтра» / «через 5 дней» / «сегодня» */
export function formatRemindIn(remindOn: string): string {
  const days = daysUntil(remindOn);
  if (days <= 0) return "сегодня";
  if (days === 1) return "завтра";
  return `через ${days} ${pluralize(days, ["день", "дня", "дней"])}`;
}
