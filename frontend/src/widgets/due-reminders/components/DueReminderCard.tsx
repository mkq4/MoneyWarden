"use client";

import { Hourglass, X } from "lucide-react";
import { toast } from "sonner";
import { useDeleteReminder, type Reminder } from "@/entities/reminder";
import { daysUntil, pluralize, toISODate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

/** «Помнишь, хотелось купить спиннинг? Прошло 14 дней — всё ещё нужно?» + «Закрыть». */
export function DueReminderCard({ reminder }: { reminder: Reminder }) {
  const remove = useDeleteReminder();
  const passed = -daysUntil(toISODate(new Date(reminder.createdAt)));

  const close = () => remove.mutate(reminder.id, { onError: (e) => toast.error(e.message) });

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-brand-soft/60 px-4 py-3.5" role="status">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-brand">
        <Hourglass className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">
          Помнишь, хотелось купить: <span className="font-semibold">{reminder.title}</span>?
        </div>
        <div className="text-xs text-muted-foreground">
          {passed > 0 ? `Прошло ${passed} ${pluralize(passed, ["день", "дня", "дней"])} — ` : ""}всё ещё нужно?
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={close} disabled={remove.isPending} className="shrink-0">
        <X /> Закрыть
      </Button>
    </div>
  );
}
