"use client";

import { cn } from "@/shared/lib/cn";
import { CATEGORY_ICON_NAMES, CATEGORY_ICONS } from "../config/icons";

/** Сетка иконок категорий; выбранная подсвечивается цветом категории. */
export function IconPicker({
  value,
  color,
  onChange,
  className,
}: {
  value: string;
  color: string;
  onChange: (icon: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-8 gap-1.5", className)}>
      {CATEGORY_ICON_NAMES.map((n) => {
        const Icon = CATEGORY_ICONS[n];
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg text-foreground/70 transition hover:bg-muted",
              selected && "ring-1 ring-current",
            )}
            style={selected ? { color, backgroundColor: `${color}1f` } : undefined}
            aria-label={n}
            aria-pressed={selected}
          >
            <Icon className="size-[18px]" />
          </button>
        );
      })}
    </div>
  );
}
