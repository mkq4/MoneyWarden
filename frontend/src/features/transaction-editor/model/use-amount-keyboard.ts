"use client";

import { useEffect } from "react";
import { pressKey } from "../lib/amount";

/**
 * Ввод суммы с физической клавиатуры (кроме случаев, когда фокус в поле ввода)
 * и Enter — сохранить.
 */
export function useAmountKeyboard(
  setAmount: React.Dispatch<React.SetStateAction<string>>,
  submit: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof HTMLInputElement;
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key === "Backspace" ? "backspace" : e.key === "." ? "," : e.key;
      if (/^[\d,]$/.test(key) || key === "backspace") {
        e.preventDefault();
        setAmount((v) => pressKey(v, key));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, setAmount, submit]);
}
