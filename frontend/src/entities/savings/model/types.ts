export interface Savings {
  /** накоплено всего, копейки */
  total: number;
}

/** Корректировка, созданная при изменении баланса накоплений */
export interface SavingsAdjustment {
  id: number;
  /** копейки, со знаком */
  amount: number;
}
