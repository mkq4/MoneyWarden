import type { Savings, SavingsAdjustment } from "../model/types";

/** GET /savings */
export type GetSavingsResponse = Savings;

/** PUT /savings/balance */
export interface SetSavingsBalanceRequest {
  /** желаемый баланс накоплений, копейки */
  targetAmount: number;
}
export interface SetSavingsBalanceResponse {
  total: number;
  /** null — баланс не изменился */
  adjustment: SavingsAdjustment | null;
}

export interface ISavingsService {
  get(): Promise<GetSavingsResponse>;
  setBalance(body: SetSavingsBalanceRequest): Promise<SetSavingsBalanceResponse>;
}
