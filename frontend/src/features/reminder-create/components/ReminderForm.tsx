"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  REMINDER_DEFAULT_DAYS,
  REMINDER_MAX_DAYS,
  REMINDER_MIN_DAYS,
  REMINDER_PRESETS,
  useCreateReminder,
} from "@/entities/reminder";
import { cn } from "@/shared/lib/cn";
import { addDays, toISODate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RemindDateChip } from "./RemindDateChip";

export function ReminderForm({ onClose }: { onClose: () => void }) {
  // Считаем один раз на открытие формы.
  const [today] = useState(() => toISODate(new Date()));
  const [title, setTitle] = useState("");
  const [remindOn, setRemindOn] = useState(() => addDays(today, REMINDER_DEFAULT_DAYS));
  const create = useCreateReminder();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { title: title.trim(), remindOn },
      {
        onSuccess: () => {
          toast.success("Напомню, когда придёт время");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={submit} className="contents">
      <DialogHeader>
        <DialogTitle>Подумать позже</DialogTitle>
        <DialogDescription>Запиши покупку и вернись к ней через время — на холодную голову.</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="reminder-title">Что хочешь купить?</Label>
        <Input
          id="reminder-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например, новый спиннинг"
          maxLength={100}
          required
          autoFocus
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label>Когда напомнить</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {REMINDER_PRESETS.map((p) => {
            const date = addDays(today, p.days);
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => setRemindOn(date)}
                className={cn(
                  "h-9 rounded-lg text-[13px] font-medium transition",
                  remindOn === date ? "bg-brand-soft text-brand" : "bg-muted hover:bg-accent",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <RemindDateChip
          value={remindOn}
          min={addDays(today, REMINDER_MIN_DAYS)}
          max={addDays(today, REMINDER_MAX_DAYS)}
          onChange={setRemindOn}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={!title.trim() || create.isPending}>
          Напомнить
        </Button>
      </DialogFooter>
    </form>
  );
}
