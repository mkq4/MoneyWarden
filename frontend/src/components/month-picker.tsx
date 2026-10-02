"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/format";
import { useMonth } from "@/lib/use-month";
import { cn } from "@/lib/utils";

const MONTHS_BACK = 24;

export function MonthPicker({ variant = "button" }: { variant?: "button" | "inline" }) {
  const [month, setMonth] = useMonth();
  const now = currentMonth();
  const options = Array.from({ length: MONTHS_BACK }, (_, i) => shiftMonth(now, -i));
  if (!options.includes(month)) options.push(month);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 transition outline-none",
          variant === "button" &&
            "h-11 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted/60",
          variant === "inline" && "-ml-0.5 text-[13px] text-muted-foreground hover:text-foreground",
        )}
      >
        {variant === "button" && <CalendarDays className="size-4 text-muted-foreground" />}
        {formatMonth(month)}
        <ChevronDown className={cn("text-muted-foreground", variant === "button" ? "size-4" : "size-3.5")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "button" ? "end" : "start"} className="max-h-80 min-w-44">
        <DropdownMenuRadioGroup value={month} onValueChange={(v) => setMonth(v as string)}>
          {options.map((m) => (
            <DropdownMenuRadioItem key={m} value={m}>
              {formatMonth(m)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
