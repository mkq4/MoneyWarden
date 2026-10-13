"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteReminder, type Reminder } from "@/entities/reminder";
import { formatDay, toISODate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { formatRemindIn } from "../lib/format-remind-in";

export function ReminderItem({ reminder, due }: { reminder: Reminder; due: boolean }) {
  const remove = useDeleteReminder();

  const onRemove = () =>
    remove.mutate(reminder.id, {
      onSuccess: () => toast.success(due ? "Напоминание закрыто" : "Напоминание удалено"),
      onError: (e) => toast.error(e.message),
    });

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{reminder.title}</div>
        <div className="text-xs text-muted-foreground">
          {due
            ? `Записано: ${formatDay(toISODate(new Date(reminder.createdAt))).toLowerCase()}`
            : `Напомню ${formatDay(reminder.remindOn).toLowerCase()} · ${formatRemindIn(reminder.remindOn)}`}
        </div>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onRemove}
        disabled={remove.isPending}
        aria-label={due ? "Закрыть" : "Удалить"}
        className="opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        <Trash2 />
      </Button>
    </div>
  );
}
