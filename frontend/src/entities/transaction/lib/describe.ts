import type { SavingTransactionType, Transaction } from "../model/types";

const SAVING_LABELS: Record<SavingTransactionType, string> = {
  SAVING: "Отложено",
  SAVING_ADJUSTMENT: "Корректировка накоплений",
};

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
