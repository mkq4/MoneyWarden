"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDay } from "@/shared/lib/format";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/** Чип «📅 27 октября» + календарь, где доступны только дни между min и max. */
export function RemindDateChip({
  value,
  min,
  max,
  onChange,
}: {
  value: string;
  min: string;
  max: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pick = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm transition outline-none hover:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring/30 data-popup-open:bg-accent",
        )}
        aria-label="Дата напоминания"
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        {formatDay(value)}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-auto rounded-2xl p-3 shadow-xl">
        <Calendar value={value} onChange={pick} min={min} max={max} />
      </PopoverContent>
    </Popover>
  );
}
