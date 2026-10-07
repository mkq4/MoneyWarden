"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDay, toISODate } from "@/shared/lib/format";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/** Чип даты «📅 Сегодня» + календарь в стиле приложения. */
export function DateChip({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  // Считаем один раз на открытие формы; «вчера» — календарно, без «минус 24 часа» (переход на летнее время).
  const [{ today, yesterday }] = useState(() => {
    const now = new Date();
    return {
      today: toISODate(now),
      yesterday: toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
    };
  });
  const pick = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm transition outline-none hover:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring/30 data-popup-open:bg-accent",
        )}
        aria-label="Дата операции"
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        {formatDay(value)}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-auto gap-3 rounded-2xl p-3 shadow-xl">
        <div className="flex gap-1.5">
          {[
            { label: "Сегодня", date: today },
            { label: "Вчера", date: yesterday },
          ].map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => pick(q.date)}
              className={cn(
                "h-8 flex-1 rounded-lg text-[13px] font-medium transition",
                value === q.date ? "bg-brand-soft text-brand" : "bg-muted hover:bg-accent",
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
        <Calendar value={value} onChange={pick} max={today} />
      </PopoverContent>
    </Popover>
  );
}
