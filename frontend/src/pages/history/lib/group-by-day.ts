import type { Transaction } from "@/entities/transaction";

export interface DayGroup {
  date: string;
  items: Transaction[];
  /** расходы за день, копейки */
  spent: number;
}

/** Группирует отсортированные по дате операции по дням. */
export function groupByDay(items: Transaction[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const tx of items) {
    const last = groups.at(-1);
    const group = last?.date === tx.date ? last : { date: tx.date, items: [], spent: 0 };
    if (group !== last) groups.push(group);
    group.items.push(tx);
    if (tx.type === "EXPENSE") group.spent += tx.amount;
  }
  return groups;
}
