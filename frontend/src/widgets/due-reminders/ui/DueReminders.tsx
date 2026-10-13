"use client";

import { isDue, useReminders } from "@/entities/reminder";
import { toISODate } from "@/shared/lib/format";
import { DueReminderCard } from "../components";

/** Наступившие напоминания об отложенных покупках; если их нет — ничего. */
export function DueReminders() {
  const { data } = useReminders();
  const today = toISODate(new Date());
  const due = data?.filter((r) => isDue(r, today)) ?? [];
  if (due.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {due.map((r) => (
        <DueReminderCard key={r.id} reminder={r} />
      ))}
    </div>
  );
}
