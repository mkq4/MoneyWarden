import { formatMoney } from "@/shared/lib/format";
import type { TransactionType } from "../model/types";

/**
 * Сумма для истории: «− 450 ₽», «+ 85 000 ₽». Отложенное — без знака
 * (деньги не потрачены, а перенесены), корректировка — со знаком самой суммы.
 */
export function formatSigned(kopecks: number, type: TransactionType): string {
  switch (type) {
    case "INCOME":
      return `+ ${formatMoney(kopecks)}`;
    case "EXPENSE":
      return `− ${formatMoney(kopecks)}`;
    case "SAVING":
      return formatMoney(kopecks);
    case "SAVING_ADJUSTMENT":
      return `${kopecks < 0 ? "−" : "+"} ${formatMoney(kopecks)}`;
  }
}
