"use client";

import { ChevronDown } from "lucide-react";
import { CategoryIcon, useCategories } from "@/entities/category";
import { cn } from "@/shared/lib/cn";
import { pluralize } from "@/shared/lib/format";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { TypeFilter } from "../model/types";

export function CategoryFilter({
  type,
  value,
  onChange,
}: {
  type: TypeFilter;
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const { data = [] } = useCategories({ includeArchived: true });
  const categories = data.filter((c) => type === "ALL" || c.type === type);
  const label =
    value.length === 0
      ? "Все категории"
      : value.length === 1
        ? (data.find((c) => c.id === value[0])?.name ?? "1 категория")
        : `${value.length} ${pluralize(value.length, ["категория", "категории", "категорий"])}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-10 shrink-0 items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-sm transition hover:bg-muted/60 md:w-52",
          value.length > 0 && "border-foreground/20 font-medium",
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-60">
        {value.length > 0 && (
          <>
            <DropdownMenuItem onClick={() => onChange([])}>Сбросить</DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {categories.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            closeOnClick={false}
            checked={value.includes(c.id)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, c.id] : value.filter((id) => id !== c.id))
            }
          >
            <CategoryIcon icon={c.icon} color={c.color} size="sm" className="size-6 [&_svg]:size-3.5" />
            <span className={cn(c.archivedAt && "text-muted-foreground")}>
              {c.name}
              {type === "ALL" && <span className="text-muted-foreground"> · {c.type === "INCOME" ? "доход" : "расход"}</span>}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
