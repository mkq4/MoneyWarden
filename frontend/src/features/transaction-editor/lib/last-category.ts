import type { CategoryType } from "@/entities/category";
import { LAST_CATEGORY_KEY } from "../model/transaction-editor.const";

/** Последняя выбранная категория типа — подставляется в новую операцию. */
export function readLastCategory(type: CategoryType): number | null {
  try {
    const value = Number(localStorage.getItem(LAST_CATEGORY_KEY + type));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeLastCategory(type: CategoryType, id: number): void {
  try {
    localStorage.setItem(LAST_CATEGORY_KEY + type, String(id));
  } catch {
    /* приватный режим — не страшно */
  }
}
