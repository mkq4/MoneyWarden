import type { TransactionType } from "@/entities/transaction";

/** Ввод суммы: максимум 10 млн ₽ (лимит бэкенда) — 8 цифр целой части. */
export const MAX_AMOUNT_INT_DIGITS = 8;

/** Префикс ключа localStorage с последней выбранной категорией типа. */
export const LAST_CATEGORY_KEY = "mw:last-category:";

export const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "backspace"];

export const SAVE_BUTTON_COLORS: Record<TransactionType, string> = {
  INCOME: "bg-income hover:bg-income/90",
  EXPENSE: "bg-expense hover:bg-expense/90",
  SAVING: "bg-brand hover:bg-brand/90",
  SAVING_ADJUSTMENT: "bg-brand hover:bg-brand/90",
};
