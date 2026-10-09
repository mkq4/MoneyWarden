import { SAVING_LABELS } from "../model/transaction.const";
import type { Transaction } from "../model/types";

/**
 * Заголовок — комментарий (если есть) или категория/название типа;
 * подзаголовок — категория или «Доход»/«Расход»/«Накопления».
 */
export function describeTransaction(tx: Transaction): { title: string; subtitle: string } {
  if (tx.type === "SAVING" || tx.type === "SAVING_ADJUSTMENT") {
    const label = SAVING_LABELS[tx.type];
    return tx.comment ? { title: tx.comment, subtitle: label } : { title: label, subtitle: "Накопления" };
  }
  const fallback = tx.type === "INCOME" ? "Доход" : "Расход";
  const category = tx.category?.name ?? fallback;
  return tx.comment ? { title: tx.comment, subtitle: category } : { title: category, subtitle: fallback };
}
