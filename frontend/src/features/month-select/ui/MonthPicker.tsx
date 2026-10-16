"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useActiveMonths } from "@/entities/stats";
import { cn } from "@/shared/lib/cn";
import { currentMonth, formatMonth } from "@/shared/lib/format";
import { useMonth } from "@/shared/lib/month-param";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function MonthPicker({ variant = "button" }: { variant?: "button" | "inline" }) {
  const [month, setMonth] = useMonth();
  const { data: active = [] } = useActiveMonths();
  // Только месяцы с операциями + текущий (чтобы было куда вносить) + выбранный (мог прийти из ?m=)
  const options = [...new Set([currentMonth(), month, ...active])].sort().reverse();

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
        <DropdownMenuRadioGroup
          value={month}
          onValueChange={(value) => {
            if (typeof value === "string") setMonth(value);
          }}
        >
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
