"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatMonth, shiftMonth, toISODate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** Шесть недель (42 дня) с понедельника, покрывающие месяц 'YYYY-MM'. */
function monthGrid(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7; // понедельник = 0
  return Array.from({ length: 42 }, (_, i) => toISODate(new Date(y, m - 1, 1 - offset + i)));
}

/**
 * Календарь в стиле приложения. Даты — строки YYYY-MM-DD (локальные),
 * их можно сравнивать как строки.
 */
export function Calendar({
  value,
  onChange,
  max,
}: {
  value: string;
  onChange: (date: string) => void;
  /** последняя доступная дата, включительно */
  max?: string;
}) {
  const [month, setMonth] = useState(value.slice(0, 7));
  const today = toISODate(new Date());
  const days = monthGrid(month);
  const canGoNext = !max || shiftMonth(month, 1) <= max.slice(0, 7);

  return (
    <div className="w-[17.5rem] select-none">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[15px] font-semibold tracking-tight">{formatMonth(month)}</span>
        <div className="flex gap-1">
          <NavButton label="Предыдущий месяц" onClick={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft />
          </NavButton>
          <NavButton label="Следующий месяц" onClick={() => setMonth(shiftMonth(month, 1))} disabled={!canGoNext}>
            <ChevronRight />
          </NavButton>
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
          const disabled = !!max && day > max;
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

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
