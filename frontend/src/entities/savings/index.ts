export { useSavings, useSetSavingsBalance } from "./api/queries";
export { savingsService } from "./api/savings.service";
export type {
  GetSavingsResponse,
  ISavingsService,
  SetSavingsBalanceRequest,
  SetSavingsBalanceResponse,
} from "./api/savings.service.interface";
export { isSavings, isSavingsAdjustment } from "./model/guards";
export type { Savings, SavingsAdjustment } from "./model/types";
