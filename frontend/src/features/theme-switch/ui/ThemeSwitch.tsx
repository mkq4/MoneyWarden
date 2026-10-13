"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/shared/lib/cn";
import { THEME_OPTIONS } from "../model/theme-switch.const";

const subscribe = () => () => {};

/** Переключатель «Светлая / Тёмная». */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  // Выбранная тема известна только в браузере — до гидрации ничего не подсвечиваем.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const current = mounted ? theme : undefined;

  return (
    <div className="grid h-10 grid-cols-2 rounded-xl bg-muted p-1 text-sm sm:w-72" role="radiogroup" aria-label="Тема">
      {THEME_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={current === o.value}
          onClick={() => setTheme(o.value)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg font-medium transition",
            current === o.value ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <o.icon className="size-4" />
          <span className="truncate">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
