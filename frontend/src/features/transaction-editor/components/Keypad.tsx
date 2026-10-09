"use client";

import { Delete } from "lucide-react";
import { KEYPAD_KEYS } from "../model/transaction-editor.const";

export function Keypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {KEYPAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          className="flex h-13 items-center justify-center rounded-xl text-2xl font-normal text-foreground/90 transition select-none hover:bg-muted active:scale-95 active:bg-muted"
          aria-label={key === "backspace" ? "Стереть" : key}
        >
          {key === "backspace" ? (
            <Delete className="size-6 text-muted-foreground" strokeWidth={1.75} />
          ) : key === "," ? (
            <span className="text-muted-foreground">,</span>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
}
