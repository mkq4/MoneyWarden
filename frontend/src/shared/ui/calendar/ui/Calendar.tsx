"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatMonth, shiftMonth, toISODate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { CalendarNavButton } from "../components";
import { monthGrid } from "../lib/month-grid";
import { WEEKDAYS } from "../model/calendar.const";

/**
 * Календарь в стиле приложения. Даты — строки YYYY-MM-DD (локальные),
 * их можно сравнивать как строки.
 */
export function Calendar({
  value,
  onChange,
  min,
  max,
}: {
  value: string;
  onChange: (date: string) => void;
  /** первая доступная дата, включительно */
  min?: string;
  /** последняя доступная дата, включительно */
  max?: string;
}) {
  const [month, setMonth] = useState(value.slice(0, 7));
  const today = toISODate(new Date());
  const days = monthGrid(month);
  const canGoPrev = !min || shiftMonth(month, -1) >= min.slice(0, 7);
  const canGoNext = !max || shiftMonth(month, 1) <= max.slice(0, 7);

  return (
    <div className="w-[17.5rem] select-none">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[15px] font-semibold tracking-tight">{formatMonth(month)}</span>
        <div className="flex gap-1">
          <CalendarNavButton label="Предыдущий месяц" onClick={() => setMonth(shiftMonth(month, -1))} disabled={!canGoPrev}>
            <ChevronLeft />
          </CalendarNavButton>
          <CalendarNavButton label="Следующий месяц" onClick={() => setMonth(shiftMonth(month, 1))} disabled={!canGoNext}>
            <ChevronRight />
          </CalendarNavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5" role="grid" aria-label={formatMonth(month)}>
        {days.map((day) => {
          const outside = day.slice(0, 7) !== month;
          const selected = day === value;
          const disabled = (!!min && day < min) || (!!max && day > max);
          const isToday = day === today;
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onChange(day)}
              aria-pressed={selected}
              aria-label={day}
              className={cn(
                "relative mx-auto flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition",
                "hover:bg-muted disabled:pointer-events-none disabled:text-muted-foreground/35",
                outside && "text-muted-foreground/50",
                isToday && !selected && "font-semibold text-brand",
                selected && "bg-brand font-semibold text-white hover:bg-brand/90",
              )}
            >
              {Number(day.slice(8))}
              {isToday && !selected && (
                <span className="absolute bottom-1 size-1 rounded-full bg-brand" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
