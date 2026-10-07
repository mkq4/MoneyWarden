import { request } from "@/shared/api";
import { isNumber, nullable, shape, type Guard } from "@/shared/lib/guards";
import { isSavings, isSavingsAdjustment } from "../model/guards";
import type { ISavingsService, SetSavingsBalanceResponse } from "./savings.service.interface";

const isSetSavingsBalanceResponse: Guard<SetSavingsBalanceResponse> = shape<SetSavingsBalanceResponse>({
  total: isNumber,
  adjustment: nullable(isSavingsAdjustment),
});

export const savingsService: ISavingsService = {
  get: () => request("GET", "/savings", isSavings),
  setBalance: (body) => request("PUT", "/savings/balance", isSetSavingsBalanceResponse, { body }),
};
